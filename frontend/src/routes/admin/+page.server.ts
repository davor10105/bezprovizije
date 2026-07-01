import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: users, error } = await supabase
		.from('profiles')
		.select('id, full_name, phone, role, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		return { users: [], error: error.message };
	}

	return { users: users ?? [] };
};
