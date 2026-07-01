import type { ListingType, PropertyType } from '$lib/types/property';
import { LISTING_TYPES, PROPERTY_TYPES } from '$lib/properties/schema';
import { parsePageParam } from '$lib/pagination';

export type SearchSort = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export type SearchFilters = {
	listingType: ListingType | '';
	propertyType: PropertyType | '';
	minPrice: number | null;
	maxPrice: number | null;
	minSqm: number | null;
	maxSqm: number | null;
	county: string;
	city: string;
	neighborhoods: string[];
	sort: SearchSort;
	page: number;
	rooms: string;
	bathrooms: string;
	minBuildYear: number | null;
	minParking: number | null;
	/** attribute key -> filter value (select option, "true"/"false", or min number as string) */
	attributes: Record<string, string>;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
	listingType: '',
	propertyType: '',
	minPrice: null,
	maxPrice: null,
	minSqm: null,
	maxSqm: null,
	county: '',
	city: '',
	neighborhoods: [],
	sort: 'newest',
	page: 1,
	rooms: '',
	bathrooms: '',
	minBuildYear: null,
	minParking: null,
	attributes: {}
};

const MULTI_VALUE_PARAMS = new Set(['neighborhood']);

function parseOptionalNumber(value: string | null): number | null {
	if (!value?.trim()) return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
}

function parseListingType(value: string | null): ListingType | '' {
	if (!value) return '';
	return LISTING_TYPES.includes(value as ListingType) ? (value as ListingType) : '';
}

function parsePropertyType(value: string | null): PropertyType | '' {
	if (!value) return '';
	return PROPERTY_TYPES.includes(value as PropertyType) ? (value as PropertyType) : '';
}

function parseSort(value: string | null): SearchSort {
	if (value === 'oldest' || value === 'price_asc' || value === 'price_desc') return value;
	return 'newest';
}

export function parseSearchParams(params: URLSearchParams): SearchFilters {
	const attributes: Record<string, string> = {};
	for (const [key, value] of params.entries()) {
		if (!key.startsWith('a_') || !value.trim()) continue;
		attributes[key.slice(2)] = value.trim();
	}

	return {
		listingType: parseListingType(params.get('listing')),
		propertyType: parsePropertyType(params.get('type')),
		minPrice: parseOptionalNumber(params.get('minPrice')),
		maxPrice: parseOptionalNumber(params.get('maxPrice')),
		minSqm: parseOptionalNumber(params.get('minSqm')),
		maxSqm: parseOptionalNumber(params.get('maxSqm')),
		county: params.get('county')?.trim() ?? '',
		city: params.get('city')?.trim() ?? '',
		neighborhoods: params.getAll('neighborhood').map((v) => v.trim()).filter(Boolean),
		sort: parseSort(params.get('sort')),
		page: parsePageParam(params.get('page')),
		rooms: params.get('rooms')?.trim() ?? '',
		bathrooms: params.get('bathrooms')?.trim() ?? '',
		minBuildYear: parseOptionalNumber(params.get('minBuildYear')),
		minParking: parseOptionalNumber(params.get('minParking')),
		attributes
	};
}

export function searchParamsFromFilters(filters: SearchFilters, options?: { page?: number }): URLSearchParams {
	const params = new URLSearchParams();
	const page = options?.page ?? filters.page;

	if (filters.listingType) params.set('listing', filters.listingType);
	if (filters.propertyType) params.set('type', filters.propertyType);
	if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
	if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
	if (filters.minSqm != null) params.set('minSqm', String(filters.minSqm));
	if (filters.maxSqm != null) params.set('maxSqm', String(filters.maxSqm));
	if (filters.county) params.set('county', filters.county);
	if (filters.city) params.set('city', filters.city);
	for (const neighborhood of filters.neighborhoods) {
		params.append('neighborhood', neighborhood);
	}
	if (filters.sort !== 'newest') params.set('sort', filters.sort);
	if (filters.rooms) params.set('rooms', filters.rooms);
	if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
	if (filters.minBuildYear != null) params.set('minBuildYear', String(filters.minBuildYear));
	if (filters.minParking != null) params.set('minParking', String(filters.minParking));

	for (const [key, value] of Object.entries(filters.attributes)) {
		if (value) params.set(`a_${key}`, value);
	}

	if (page > 1) params.set('page', String(page));

	return params;
}

export function searchHref(filters: SearchFilters, options?: { page?: number }): string {
	const params = searchParamsFromFilters(filters, options);
	const query = params.toString();
	return query ? `/pretraga?${query}` : '/pretraga';
}

export function countActiveExtraFilters(filters: SearchFilters): number {
	let count = 0;
	if (filters.rooms) count++;
	if (filters.bathrooms) count++;
	if (filters.minBuildYear != null) count++;
	if (filters.minParking != null) count++;
	count += Object.values(filters.attributes).filter(Boolean).length;
	return count;
}

export function formDataToSearchParams(formData: FormData): URLSearchParams {
	const params = new URLSearchParams();

	for (const [key, value] of formData.entries()) {
		if (typeof value !== 'string' || !value.trim()) continue;
		if (MULTI_VALUE_PARAMS.has(key)) {
			params.append(key, value.trim());
		} else {
			params.set(key, value.trim());
		}
	}

	params.delete('page');
	return params;
}
