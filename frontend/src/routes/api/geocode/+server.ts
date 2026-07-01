import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GeocodeResult } from '$lib/types/property';

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'BezProvizije.hr/1.0 (property listing app)';

type NominatimAddress = Record<string, string>;

function formatShortAddress(address: NominatimAddress | undefined, displayName: string): string {
	if (!address) {
		return displayName.split(',').slice(0, 3).join(',').trim();
	}

	const parts: string[] = [];

	if (address.road) {
		const street = address.house_number ? `${address.road} ${address.house_number}` : address.road;
		parts.push(street);
	} else if (address.pedestrian) {
		parts.push(address.pedestrian);
	} else if (address.footway) {
		parts.push(address.footway);
	}

	const locality =
		address.city ||
		address.town ||
		address.village ||
		address.municipality ||
		address.county;

	if (locality && !parts.includes(locality)) {
		parts.push(locality);
	}

	if (address.postcode) {
		parts.push(address.postcode);
	}

	if (parts.length > 0) {
		return parts.join(', ');
	}

	return displayName.split(',').slice(0, 3).join(',').trim();
}

function toGeocodeResult(item: {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
	address?: NominatimAddress;
}): GeocodeResult {
	const short_name = formatShortAddress(item.address, item.display_name);
	return {
		id: String(item.place_id),
		display_name: item.display_name,
		short_name,
		lat: Number(item.lat),
		lng: Number(item.lon)
	};
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const lat = url.searchParams.get('lat');
	const lng = url.searchParams.get('lng');

	if (lat && lng) {
		const params = new URLSearchParams({
			format: 'json',
			lat,
			lon: lng,
			addressdetails: '1',
			zoom: '18'
		});

		const response = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
			headers: { 'User-Agent': USER_AGENT }
		});

		if (!response.ok) {
			return json([], { status: 502 });
		}

		const data = (await response.json()) as {
			place_id: number;
			display_name: string;
			lat: string;
			lon: string;
			address?: NominatimAddress;
		};

		if (!data.display_name) {
			return json([]);
		}

		return json([toGeocodeResult(data)]);
	}

	const query = url.searchParams.get('q')?.trim();

	if (!query || query.length < 3) {
		return json([]);
	}

	const params = new URLSearchParams({
		format: 'json',
		q: query,
		countrycodes: 'hr',
		limit: '8',
		addressdetails: '1',
		'accept-language': 'hr'
	});

	const response = await fetch(`${NOMINATIM_SEARCH}?${params}`, {
		headers: { 'User-Agent': USER_AGENT }
	});

	if (!response.ok) {
		return json([], { status: 502 });
	}

	const data = (await response.json()) as Array<{
		place_id: number;
		display_name: string;
		lat: string;
		lon: string;
		address?: NominatimAddress;
	}>;

	const seen = new Set<string>();
	const results: GeocodeResult[] = [];

	for (const item of data) {
		const result = toGeocodeResult(item);
		const key = `${result.short_name}|${result.lat.toFixed(5)}|${result.lng.toFixed(5)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		results.push(result);
	}

	return json(results);
};
