import type { LayoutServerLoad } from './$types';
import { getProfile, getSafeUser, hasAuthCookies } from '$lib/auth';

export const load: LayoutServerLoad = async ({ cookies, locals: { supabase } }) => {
	const { user } = hasAuthCookies(cookies)
		? await getSafeUser(supabase, cookies)
		: { user: null };

	let profile = null;
	if (user) {
		profile = await getProfile(supabase, user.id);
	}

	return {
		cookies: cookies.getAll(),
		profile
	};
};
