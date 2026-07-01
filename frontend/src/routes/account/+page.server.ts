import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isProfileComplete, isValidPhone, requireAuth, saveProfile, getSafeUser } from '$lib/auth';
import { fetchUserListings } from '$lib/properties/queries';
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_CONFIG } from '$lib/properties/schema';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const { user, profile } = await requireAuth(supabase);

	const listings = isProfileComplete(profile) ? await fetchUserListings(supabase, user.id) : [];
	const needsSetup = !isProfileComplete(profile);

	const tabParam = url.searchParams.get('tab');
	const defaultTab =
		needsSetup || tabParam === 'racun' || url.searchParams.get('setup') === '1'
			? 'account'
			: tabParam === 'oglasi' || url.searchParams.get('deleted') === '1'
				? 'listings'
				: 'listings';

	return {
		email: user.email ?? '',
		profile,
		needsSetup,
		defaultTab,
		listings,
		listingTypeLabels: LISTING_TYPE_LABELS,
		propertyTypeConfig: PROPERTY_TYPE_CONFIG,
		deleted: url.searchParams.get('deleted') === '1'
	};
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const fullName = (formData.get('fullName') as string)?.trim();
		const phone = (formData.get('phone') as string)?.trim();

		const errors: Record<string, string> = {};

		if (!fullName || fullName.length < 2) {
			errors.fullName = 'Unesite puno ime i prezime.';
		}

		if (!phone || !isValidPhone(phone)) {
			errors.phone = 'Unesite ispravan broj telefona.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, fullName, phone });
		}

		const { user, error: userError } = await getSafeUser(supabase);

		if (userError || !user) {
			return fail(401, { errors: { form: 'Niste prijavljeni.' }, fullName, phone });
		}

		const { error } = await saveProfile(supabase, user.id, {
			full_name: fullName,
			phone
		});

		if (error) {
			console.error('Profile save failed:', error.message);
			return fail(500, {
				errors: { form: 'Spremanje nije uspjelo. Pokušajte ponovno.' },
				fullName,
				phone
			});
		}

		return { success: true, fullName, phone };
	},

	signout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		redirect(303, '/');
	},

	deleteListing: async ({ request, locals: { supabase } }) => {
		const { user } = await requireAuth(supabase);
		const formData = await request.formData();
		const listingId = (formData.get('listingId') as string)?.trim();

		if (!listingId) {
			return fail(400, { errors: { form: 'Oglas nije pronađen.' } });
		}

		const { data: property } = await supabase
			.from('properties')
			.select('id, owner_id')
			.eq('id', listingId)
			.maybeSingle();

		if (!property || property.owner_id !== user.id) {
			return fail(403, { errors: { form: 'Nemate dozvolu za brisanje ovog oglasa.' } });
		}

		const { data: images } = await supabase
			.from('property_images')
			.select('storage_path')
			.eq('property_id', listingId);

		const { error: deleteError } = await supabase.from('properties').delete().eq('id', listingId);

		if (deleteError) {
			console.error('Listing delete failed:', deleteError.message);
			return fail(500, { errors: { form: 'Brisanje oglasa nije uspjelo.' } });
		}

		const paths = (images ?? []).map((img) => img.storage_path);
		if (paths.length > 0) {
			await supabase.storage.from('property-images').remove(paths);
		}

		return { deletedListing: true };
	}
};
