import { error, fail, redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Actions, PageServerLoad } from './$types';
import { isAdmin, isProfileComplete, requireAuth } from '$lib/auth';
import { parseListingForm } from '$lib/properties/listingForm';
import {
	IMAGE_ORDER_EXISTING_PREFIX,
	IMAGE_ORDER_NEW,
	parseImageOrderTokens
} from '$lib/properties/imageOrder';
import { resolveLocationFromCoords } from '$lib/properties/location';
import {
	CORE_OPTIONAL_FIELDS,
	LISTING_TYPE_LABELS,
	PROPERTY_TYPE_CONFIG,
	getPublicImageUrl
} from '$lib/properties/schema';

const MAX_IMAGES = 12;

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const loginRedirect = `/prijava?action=login&redirect=/uredi-oglas/${params.id}`;
	const { user, profile } = await requireAuth(supabase, loginRedirect);

	if (!isProfileComplete(profile)) {
		redirect(303, '/account?setup=1');
	}

	const { data: property, error: loadError } = await supabase
		.from('properties')
		.select('*')
		.eq('id', params.id)
		.maybeSingle();

	if (loadError || !property) {
		error(404, 'Oglas nije pronađen');
	}

	if (property.owner_id !== user.id && !isAdmin(profile)) {
		error(403, 'Nemate dozvolu za uređivanje ovog oglasa');
	}

	const { data: images } = await supabase
		.from('property_images')
		.select('id, storage_path, sort_order')
		.eq('property_id', params.id)
		.order('sort_order');

	return {
		isAdmin: isAdmin(profile),
		property: {
			id: property.id,
			title: property.title,
			description: property.description,
			listing_type: property.listing_type,
			property_type: property.property_type,
			address: property.address,
			lat: property.lat,
			lng: property.lng,
			price: Number(property.price),
			sqm: Number(property.sqm),
			rooms: property.rooms,
			bathrooms: property.bathrooms,
			build_year: property.build_year,
			parking_spaces: property.parking_spaces,
			attributes: property.attributes ?? {},
			approval_status: property.approval_status
		},
		images: (images ?? []).map((img) => ({
			id: img.id,
			url: getPublicImageUrl(PUBLIC_SUPABASE_URL, img.storage_path),
			storage_path: img.storage_path
		})),
		propertyTypeConfig: PROPERTY_TYPE_CONFIG,
		listingTypeLabels: LISTING_TYPE_LABELS,
		coreOptionalFields: CORE_OPTIONAL_FIELDS
	};
};

export const actions: Actions = {
	update: async ({ request, fetch, params, locals: { supabase } }) => {
		const loginRedirect = `/prijava?action=login&redirect=/uredi-oglas/${params.id}`;
		const { user, profile } = await requireAuth(supabase, loginRedirect);

		const { data: existing } = await supabase
			.from('properties')
			.select('id, owner_id')
			.eq('id', params.id)
			.maybeSingle();

		if (!existing || (existing.owner_id !== user.id && !isAdmin(profile))) {
			return fail(403, { errors: { form: 'Nemate dozvolu za uređivanje ovog oglasa.' } });
		}

		const formData = await request.formData();
		const removeImageIds = formData.getAll('remove_image_ids').map(String);

		const { data: currentImages } = await supabase
			.from('property_images')
			.select('id, storage_path, sort_order')
			.eq('property_id', params.id);

		const remainingExisting = (currentImages ?? [])
			.filter((img) => !removeImageIds.includes(img.id))
			.sort((a, b) => a.sort_order - b.sort_order);

		const { payload, images, errors } = parseListingForm(formData, { imagesRequired: false });

		if (!payload || Object.keys(errors).length > 0) {
			return fail(400, { errors, values: Object.fromEntries(formData) });
		}

		if (remainingExisting.length + images.length === 0) {
			return fail(400, { errors: { images: 'Oglas mora imati barem jednu fotografiju.' } });
		}

		if (remainingExisting.length + images.length > MAX_IMAGES) {
			return fail(400, { errors: { images: `Maksimalno ${MAX_IMAGES} fotografija.` } });
		}

		const needsReapproval = !isAdmin(profile);
		const location = await resolveLocationFromCoords(fetch, payload.lat, payload.lng);

		const { error: updateError } = await supabase
			.from('properties')
			.update({
				title: payload.title,
				description: payload.description,
				listing_type: payload.listing_type,
				price: payload.price,
				sqm: payload.sqm,
				property_type: payload.property_type,
				address: payload.address,
				lat: payload.lat,
				lng: payload.lng,
				county: location.county,
				city: location.city,
				neighborhood: location.neighborhood,
				rooms: payload.rooms,
				bathrooms: payload.bathrooms,
				build_year: payload.build_year,
				parking_spaces: payload.parking_spaces,
				attributes: payload.attributes,
				...(needsReapproval ? { approval_status: 'pending' } : {})
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Property update failed:', updateError.message);
			return fail(500, { errors: { form: 'Spremanje oglasa nije uspjelo. Pokušajte ponovno.' } });
		}

		if (removeImageIds.length > 0) {
			const pathsToRemove = (currentImages ?? [])
				.filter((img) => removeImageIds.includes(img.id))
				.map((img) => img.storage_path);

			await supabase.from('property_images').delete().in('id', removeImageIds);

			if (pathsToRemove.length > 0) {
				await supabase.storage.from('property-images').remove(pathsToRemove);
			}
		}

		const submittedImageOrder = parseImageOrderTokens(formData);
		const imageOrder =
			submittedImageOrder.length > 0
				? submittedImageOrder
				: [
						...remainingExisting.map((img) => `${IMAGE_ORDER_EXISTING_PREFIX}${img.id}`),
						...images.map(() => IMAGE_ORDER_NEW)
					];
		const remainingIds = new Set(remainingExisting.map((img) => img.id));
		const orderedExistingIds = imageOrder
			.filter((token) => token.startsWith(IMAGE_ORDER_EXISTING_PREFIX))
			.map((token) => token.slice(IMAGE_ORDER_EXISTING_PREFIX.length));

		if (
			imageOrder.length !== remainingExisting.length + images.length ||
			orderedExistingIds.length !== remainingExisting.length ||
			orderedExistingIds.some((id) => !remainingIds.has(id))
		) {
			return fail(400, {
				errors: { images: 'Redoslijed fotografija nije valjan. Osvježite stranicu i pokušajte ponovno.' }
			});
		}

		let newFileIndex = 0;
		let sortOrder = 0;

		for (const token of imageOrder) {
			if (token.startsWith(IMAGE_ORDER_EXISTING_PREFIX)) {
				const imageId = token.slice(IMAGE_ORDER_EXISTING_PREFIX.length);
				const { data: updated, error: sortError } = await supabase
					.from('property_images')
					.update({ sort_order: sortOrder })
					.eq('id', imageId)
					.eq('property_id', params.id)
					.select('id');

				if (sortError || !updated?.length) {
					console.error('Image sort update failed:', sortError?.message ?? 'no rows updated');
					return fail(500, {
						errors: {
							images:
								'Ažuriranje redoslijeda fotografija nije uspjelo. Provjerite je li migracija baze primijenjena.'
						}
					});
				}

				sortOrder += 1;
				continue;
			}

			if (token !== IMAGE_ORDER_NEW) {
				return fail(400, {
					errors: { images: 'Redoslijed fotografija nije valjan. Osvježite stranicu i pokušajte ponovno.' }
				});
			}

			const image = images[newFileIndex];
			if (!image) {
				return fail(400, {
					errors: { images: 'Redoslijed fotografija nije valjan. Osvježite stranicu i pokušajte ponovno.' }
				});
			}

			newFileIndex += 1;
			const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg';
			const storagePath = `${user.id}/${params.id}/${sortOrder}-${crypto.randomUUID()}.${ext}`;

			const { error: uploadError } = await supabase.storage
				.from('property-images')
				.upload(storagePath, image, {
					contentType: image.type,
					upsert: false
				});

			if (uploadError) {
				console.error('Image upload failed:', uploadError.message);
				return fail(500, {
					errors: { images: 'Učitavanje novih fotografija nije uspjelo.' }
				});
			}

			const { error: imageRowError } = await supabase.from('property_images').insert({
				property_id: params.id,
				storage_path: storagePath,
				sort_order: sortOrder
			});

			if (imageRowError) {
				console.error('Property image row failed:', imageRowError.message);
				return fail(500, {
					errors: { images: 'Spremanje fotografija nije uspjelo.' }
				});
			}

			sortOrder += 1;
		}

		if (newFileIndex !== images.length) {
			return fail(400, {
				errors: { images: 'Redoslijed fotografija nije valjan. Osvježite stranicu i pokušajte ponovno.' }
			});
		}

		redirect(
			303,
			needsReapproval
				? `/nekretnina/${params.id}?pending=1`
				: `/nekretnina/${params.id}?updated=1`
		);
	},

	delete: async ({ params, locals: { supabase } }) => {
		const { user, profile } = await requireAuth(supabase);

		const { data: property } = await supabase
			.from('properties')
			.select('id, owner_id')
			.eq('id', params.id)
			.maybeSingle();

		if (!property || (property.owner_id !== user.id && !isAdmin(profile))) {
			return fail(403, { errors: { form: 'Nemate dozvolu za brisanje ovog oglasa.' } });
		}

		const { data: images } = await supabase
			.from('property_images')
			.select('storage_path')
			.eq('property_id', params.id);

		const { error: deleteError } = await supabase.from('properties').delete().eq('id', params.id);

		if (deleteError) {
			console.error('Property delete failed:', deleteError.message);
			return fail(500, { errors: { form: 'Brisanje oglasa nije uspjelo.' } });
		}

		const paths = (images ?? []).map((img) => img.storage_path);
		if (paths.length > 0) {
			await supabase.storage.from('property-images').remove(paths);
		}

		redirect(303, '/account?tab=oglasi&deleted=1');
	}
};
