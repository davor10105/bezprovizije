import type { LayoutServerLoad } from './$types';
import { getProfile } from '$lib/auth';

export const load: LayoutServerLoad = async ({ cookies, locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	let profile = null;
	if (user) {
		profile = await getProfile(supabase, user.id);
	}

	return {
		cookies: cookies.getAll(),
		profile
	};
};
