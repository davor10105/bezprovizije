import type { PageServerLoad } from './$types';
import { fetchRecentBlogCards } from '$lib/blog/queries';
import { fetchApprovedListings } from '$lib/properties/queries';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [recentBlogs, listings] = await Promise.all([
		fetchRecentBlogCards(supabase, 4),
		fetchApprovedListings(supabase)
	]);

	return {
		recentBlogs,
		recentListings: listings.slice(0, 4),
		mapListings: listings
	};
};
