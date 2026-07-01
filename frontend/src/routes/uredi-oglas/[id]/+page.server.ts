import { error, fail, redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Actions, PageServerLoad } from './$types';
import { isAdmin, isProfileComplete, requireAuth } from '$lib/auth';
import { parseListingForm } from '$lib/properties/listingForm';
import { resolveLocationFromCoords } from '$lib/properties/location';
import {
	ATTRIBUTE_FIELDS_BY_TYPE,
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
		coreOptionalFields: CORE_OPTIONAL_FIELDS,
		attributeFieldsByType: ATTRIBUTE_FIELDS_BY_TYPE
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
			.select('id, storage_path')
			.eq('property_id', params.id);

		const remainingExisting = (currentImages ?? []).filter(
			(img) => !removeImageIds.includes(img.id)
		);

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

		const startOrder = remainingExisting.length;
		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg';
			const storagePath = `${user.id}/${params.id}/${startOrder + i}-${crypto.randomUUID()}.${ext}`;

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
				sort_order: startOrder + i
			});

			if (imageRowError) {
				console.error('Property image row failed:', imageRowError.message);
				return fail(500, {
					errors: { images: 'Spremanje fotografija nije uspjelo.' }
				});
			}
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
