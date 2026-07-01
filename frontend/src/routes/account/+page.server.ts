import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isProfileComplete, isValidPhone, requireAuth, saveProfile } from '$lib/auth';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { user, profile } = await requireAuth(supabase);

	return {
		email: user.email ?? '',
		profile,
		needsSetup: !isProfileComplete(profile)
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

		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();

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
	}
};
