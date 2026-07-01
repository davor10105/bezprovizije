import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { user, profile } = await requireAdmin(supabase);

	const { data: users, error } = await supabase
		.from('profiles')
		.select('id, full_name, phone, role, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		return { user, profile, users: [], error: error.message };
	}

	return { user, profile, users: users ?? [] };
};
