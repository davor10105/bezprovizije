import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { isAdmin, requireAdmin } from '$lib/auth';
import { BLOG_PAGE_SIZE, fetchAdminBlogCards, fetchPublishedBlogCards } from '$lib/blog/queries';
import { parsePageParam, totalPages } from '$lib/pagination';

export const load: PageServerLoad = async ({ url, locals: { supabase }, parent }) => {
	const { profile } = await parent();
	const page = parsePageParam(url.searchParams.get('page'));
	const admin = isAdmin(profile);

	const result = admin
		? await fetchAdminBlogCards(supabase, page, BLOG_PAGE_SIZE)
		: await fetchPublishedBlogCards(supabase, { page, pageSize: BLOG_PAGE_SIZE });

	return {
		blogs: result.blogs,
		isAdmin: admin,
		pagination: {
			page,
			pageSize: BLOG_PAGE_SIZE,
			total: result.total,
			totalPages: totalPages(result.total, BLOG_PAGE_SIZE)
		}
	};
};

export const actions: Actions = {
	delete: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const id = (await request.formData()).get('id') as string;

		if (!id) return fail(400, { message: 'Nedostaje ID članka.' });

		const { error } = await supabase.from('blogs').delete().eq('id', id);

		if (error) return fail(500, { message: error.message });
		return { success: true };
	}
};
