export type ParsedLocation = {
	county: string | null;
	city: string | null;
	neighborhood: string | null;
};

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
