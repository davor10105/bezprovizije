import type { PageServerLoad } from './$types';
import { fetchRecentBlogCards } from '$lib/blog/queries';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const recentBlogs = await fetchRecentBlogCards(supabase, 4);
	return { recentBlogs };
};
