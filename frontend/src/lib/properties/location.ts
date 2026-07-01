export type ParsedLocation = {
	county: string | null;
	city: string | null;
	neighborhood: string | null;
};

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'BezProvizije.hr/1.0 (property listing app)';

type NominatimAddress = Record<string, string>;

const EMPTY_LOCATION: ParsedLocation = {
	county: null,
	city: null,
	neighborhood: null
};

function normalizeCounty(value: string | undefined): string | null {
	if (!value?.trim()) return null;
	const trimmed = value.trim();
	if (/županija/i.test(trimmed)) return trimmed;
	return `${trimmed} županija`;
}

/** Extract county, city and neighborhood from a Nominatim address object. */
export function parseNominatimAddress(address: NominatimAddress | undefined): ParsedLocation {
	if (!address) return EMPTY_LOCATION;

	const county = normalizeCounty(address.county || address.state);
	const city =
		address.city ||
		address.town ||
		address.village ||
		address.municipality ||
		null;
	const neighborhood =
		address.suburb ||
		address.neighbourhood ||
		address.quarter ||
		address.city_district ||
		address.hamlet ||
		null;

	return {
		county,
		city: city?.trim() || null,
		neighborhood: neighborhood?.trim() || null
	};
}

export async function resolveLocationFromCoords(
	fetchFn: typeof fetch,
	lat: number,
	lng: number
): Promise<ParsedLocation> {
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
		return EMPTY_LOCATION;
	}

	const params = new URLSearchParams({
		format: 'json',
		lat: String(lat),
		lon: String(lng),
		addressdetails: '1',
		zoom: '16',
		'accept-language': 'hr'
	});

	try {
		const response = await fetchFn(`${NOMINATIM_REVERSE}?${params}`, {
			headers: { 'User-Agent': USER_AGENT }
		});

		if (!response.ok) return EMPTY_LOCATION;

		const data = (await response.json()) as { address?: NominatimAddress };
		return parseNominatimAddress(data.address);
	} catch {
		return EMPTY_LOCATION;
	}
}

export type LocationHierarchy = Record<string, Record<string, string[]>>;

export function sortLocationHierarchy(hierarchy: LocationHierarchy): LocationHierarchy {
	const sorted: LocationHierarchy = {};

	for (const county of Object.keys(hierarchy).sort((a, b) => a.localeCompare(b, 'hr'))) {
		sorted[county] = {};
		for (const city of Object.keys(hierarchy[county]).sort((a, b) => a.localeCompare(b, 'hr'))) {
			sorted[county][city] = [...hierarchy[county][city]].sort((a, b) => a.localeCompare(b, 'hr'));
		}
	}

	return sorted;
}
