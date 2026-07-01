import type { LayoutServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';

export const load: LayoutServerLoad = async ({ url, locals: { supabase } }) => {
	const { user, profile } = await requireAdmin(supabase);

	const { count } = await supabase
		.from('properties')
		.select('id', { count: 'exact', head: true })
		.eq('approval_status', 'pending');

	return {
		user,
		profile,
		activeTab: url.pathname.startsWith('/admin/oglasi') ? 'listings' : 'users',
		pendingCount: count ?? 0
	};
};
