import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isValidEmail } from '$lib/auth';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data, error } = await supabase.auth.getClaims();

	if (!error && data?.claims) {
		redirect(303, '/account');
	}

	return {};
};

export const actions: Actions = {
	login: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim();
		const password = formData.get('password') as string;

		if (!email || !isValidEmail(email)) {
			return fail(400, {
				action: 'login',
				errors: { email: 'Unesite ispravnu email adresu.' },
				email
			});
		}

		if (!password) {
			return fail(400, {
				action: 'login',
				errors: { password: 'Lozinka je obavezna.' },
				email
			});
		}

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			return fail(400, {
				action: 'login',
				errors: { form: 'Pogrešan email ili lozinka.' },
				email
			});
		}

		redirect(303, url.searchParams.get('redirect') ?? '/account');
	},

	register: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		const errors: Record<string, string> = {};

		if (!email || !isValidEmail(email)) {
			errors.email = 'Unesite ispravnu email adresu.';
		}

		if (!password || password.length < 8) {
			errors.password = 'Lozinka mora imati najmanje 8 znakova.';
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = 'Lozinke se ne podudaraju.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				action: 'register',
				errors,
				email
			});
		}

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/confirm?next=/account`
			}
		});

		if (error) {
			return fail(400, {
				action: 'register',
				errors: { form: error.message },
				email
			});
		}

		if (data.session) {
			redirect(303, '/account');
		}

		return {
			action: 'register',
			success: true,
			message:
				'Registracija uspješna! Provjerite email za potvrdu računa, zatim dovršite postavljanje profila.',
			email
		};
	}
};
