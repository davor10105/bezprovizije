import type { PageServerLoad } from './$types';
import { fetchRecentBlogCards } from '$lib/blog/queries';
import { fetchApprovedListings, fetchLocationHierarchy } from '$lib/properties/queries';
import { PROPERTY_TYPE_CONFIG } from '$lib/properties/schema';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const [recentBlogs, listings, locationHierarchy] = await Promise.all([
		fetchRecentBlogCards(supabase, 4),
		fetchApprovedListings(supabase),
		fetchLocationHierarchy(supabase)
	]);

	return {
		recentBlogs,
		recentListings: listings.slice(0, 4),
		mapListings: listings,
		locationHierarchy,
		propertyTypes: Object.entries(PROPERTY_TYPE_CONFIG).map(([value, config]) => ({
			value,
			label: config.label
		}))
	};
};
