import type { PageServerLoad } from './$types';
import { fetchApprovedListings } from '$lib/properties/queries';
import { PROPERTY_TYPE_SEARCH_LABELS } from '$lib/properties/schema';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const listings = await fetchApprovedListings(supabase);

	return {
		listings,
		propertyTypes: Object.values(PROPERTY_TYPE_SEARCH_LABELS)
	};
};
