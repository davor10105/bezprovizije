import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';
import { ADMIN_PAGE_SIZE, parsePageParam, totalPages } from '$lib/pagination';
import { fetchAdminListings } from '$lib/properties/queries';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const pendingPage = parsePageParam(url.searchParams.get('pendingPage'));
	const otherPage = parsePageParam(url.searchParams.get('otherPage'));

	const [pendingResult, otherResult] = await Promise.all([
		fetchAdminListings(supabase, {
			approvalStatus: 'pending',
			page: pendingPage,
			pageSize: ADMIN_PAGE_SIZE
		}),
		fetchAdminListings(supabase, {
			approvalStatus: 'other',
			page: otherPage,
			pageSize: ADMIN_PAGE_SIZE
		})
	]);

	const error = pendingResult.error ?? otherResult.error;

	return {
		pending: pendingResult.listings,
		other: otherResult.listings,
		error,
		pendingPagination: {
			page: pendingPage,
			pageSize: ADMIN_PAGE_SIZE,
			total: pendingResult.total,
			totalPages: totalPages(pendingResult.total, ADMIN_PAGE_SIZE)
		},
		otherPagination: {
			page: otherPage,
			pageSize: ADMIN_PAGE_SIZE,
			total: otherResult.total,
			totalPages: totalPages(otherResult.total, ADMIN_PAGE_SIZE)
		}
	};
};

export const actions: Actions = {
	approve: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const id = (await request.formData()).get('id') as string;

		if (!id) return fail(400, { message: 'Nedostaje ID oglasa.' });

		const { error } = await supabase
			.from('properties')
			.update({ approval_status: 'approved' })
			.eq('id', id);

		if (error) return fail(500, { message: error.message });
		return { success: true };
	},

	reject: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const id = (await request.formData()).get('id') as string;

		if (!id) return fail(400, { message: 'Nedostaje ID oglasa.' });

		const { error } = await supabase
			.from('properties')
			.update({ approval_status: 'rejected' })
			.eq('id', id);

		if (error) return fail(500, { message: error.message });
		return { success: true };
	}
};
