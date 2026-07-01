import type { PageServerLoad } from './$types';
import { fetchLocationHierarchy, fetchSearchListings } from '$lib/properties/queries';
import {
	PROPERTY_TYPE_CONFIG,
	getSearchableAttributeFields
} from '$lib/properties/schema';
import { parseSearchParams } from '$lib/properties/search';
import { SEARCH_PAGE_SIZE, totalPages } from '$lib/pagination';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const filters = parseSearchParams(url.searchParams);
	const [{ listings, total }, locationHierarchy] = await Promise.all([
		fetchSearchListings(supabase, filters),
		fetchLocationHierarchy(supabase)
	]);

	return {
		listings,
		total,
		filters,
		locationHierarchy,
		pageSize: SEARCH_PAGE_SIZE,
		totalPages: totalPages(total, SEARCH_PAGE_SIZE),
		propertyTypes: Object.entries(PROPERTY_TYPE_CONFIG).map(([value, config]) => ({
			value,
			label: config.label
		})),
		attributeFields: getSearchableAttributeFields()
	};
};
