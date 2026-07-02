import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isAdmin, isProfileComplete, requireAuth } from '$lib/auth';
import { parseListingForm } from '$lib/properties/listingForm';
import { resolveLocationFromCoords } from '$lib/properties/location';
import { fetchTokenSettings, listingBpCost } from '$lib/tokens/queries';
import {
	ATTRIBUTE_FIELDS_BY_TYPE,
	CORE_OPTIONAL_FIELDS,
	LISTING_TYPE_LABELS,
	PROPERTY_TYPE_CONFIG
} from '$lib/properties/schema';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const loginRedirect = '/prijava?action=login&redirect=/objavi-oglas';
	const { user, profile } = await requireAuth(supabase, loginRedirect);

	if (!isProfileComplete(profile)) {
		redirect(303, '/account?setup=1');
	}

	return {
		user,
		profile,
		tokenSettings: await fetchTokenSettings(supabase),
		propertyTypeConfig: PROPERTY_TYPE_CONFIG,
		listingTypeLabels: LISTING_TYPE_LABELS,
		coreOptionalFields: CORE_OPTIONAL_FIELDS,
		attributeFieldsByType: ATTRIBUTE_FIELDS_BY_TYPE
	};
};

export const actions: Actions = {
	default: async ({ request, fetch, locals: { supabase } }) => {
		const loginRedirect = '/prijava?action=login&redirect=/objavi-oglas';
		const { user, profile } = await requireAuth(supabase, loginRedirect);

		if (!isProfileComplete(profile)) {
			return fail(403, { errors: { form: 'Dovršite postavljanje profila prije objave oglasa.' } });
		}
		const formData = await request.formData();
		const { payload, images, errors } = parseListingForm(formData);

		if (!payload || Object.keys(errors).length > 0) {
			return fail(400, { errors, values: Object.fromEntries(formData) });
		}

		const autoApproved = isAdmin(profile);
		const listingCost = listingBpCost(
			await fetchTokenSettings(supabase),
			payload.listing_type
		);

		if (!autoApproved && (profile?.bp_balance ?? 0) < listingCost) {
			return fail(402, {
				errors: {
					form: `Nemate dovoljno BP tokena. Potrebno je ${listingCost} BP, a imate ${profile?.bp_balance ?? 0} BP.`
				}
			});
		}

		const location = await resolveLocationFromCoords(fetch, payload.lat, payload.lng);

		const { data: property, error: propertyError } = await supabase
			.from('properties')
			.insert({
				owner_id: user.id,
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
				approval_status: autoApproved ? 'approved' : 'pending'
			})
			.select('id')
			.single();

		if (propertyError || !property) {
			console.error('Property insert failed:', propertyError?.message);
			return fail(500, {
				errors: { form: 'Spremanje oglasa nije uspjelo. Pokušajte ponovno.' }
			});
		}

		if (!autoApproved) {
			const { data: deducted, error: deductError } = await supabase.rpc(
				'deduct_listing_bp' as never,
				{
					p_listing_type: payload.listing_type,
					p_property_id: property.id
				} as never
			);

			if (deductError || !deducted) {
				console.error('BP deduction failed:', deductError?.message);
				await supabase.from('properties').delete().eq('id', property.id);
				return fail(402, {
					errors: {
						form: 'Nemate dovoljno BP tokena za objavu ovog oglasa.'
					}
				});
			}
		}

		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			const ext = image.name.split('.').pop()?.toLowerCase() || 'jpg';
			const storagePath = `${user.id}/${property.id}/${i}-${crypto.randomUUID()}.${ext}`;

			const { error: uploadError } = await supabase.storage
				.from('property-images')
				.upload(storagePath, image, {
					contentType: image.type,
					upsert: false
				});

			if (uploadError) {
				console.error('Image upload failed:', uploadError.message);
				if (!autoApproved) {
					await supabase.rpc('refund_listing_bp' as never, { p_property_id: property.id } as never);
				}
				await supabase.from('properties').delete().eq('id', property.id);
				return fail(500, {
					errors: { images: 'Učitavanje fotografija nije uspjelo. Pokušajte ponovno.' }
				});
			}

			const { error: imageRowError } = await supabase.from('property_images').insert({
				property_id: property.id,
				storage_path: storagePath,
				sort_order: i
			});

			if (imageRowError) {
				console.error('Property image row failed:', imageRowError.message);
				if (!autoApproved) {
					await supabase.rpc('refund_listing_bp' as never, { p_property_id: property.id } as never);
				}
				await supabase.from('properties').delete().eq('id', property.id);
				return fail(500, {
					errors: { images: 'Spremanje fotografija nije uspjelo. Pokušajte ponovno.' }
				});
			}
		}

		redirect(
			303,
			autoApproved
				? `/nekretnina/${property.id}?published=1`
				: `/nekretnina/${property.id}?pending=1`
		);
	}
};
