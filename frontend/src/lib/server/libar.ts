import { env } from '$env/dynamic/private';
import type { ParsedLocation } from '$lib/properties/location';
import type { GeocodeResult } from '$lib/types/property';

const LIBAR_BASE = 'https://adrese.libarapi.com';
const SEARCH_LIMIT = 8;

export type LibarPostalCode = {
	postCode: number;
	postName: string;
};

export type LibarSettlement = {
	gmlId: string;
	name: string;
};

export type LibarAddressDetail = {
	gmlId: string;
	streetName: string;
	houseNumber: string;
	postalCode: LibarPostalCode;
	settlement: LibarSettlement;
	fullAddress?: string;
	lat: number;
	lon: number;
	distance?: number;
};

type LibarSearchHit = {
	gmlId: string;
	fullAddress: string;
};

function getApiKey(): string {
	const key = env.LIBAR_API_KEY?.trim();
	if (!key) {
		throw new Error('LIBAR_API_KEY is not configured');
	}
	return key;
}

async function libarFetch(path: string, params?: Record<string, string>): Promise<Response> {
	const url = new URL(path, LIBAR_BASE);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
	}

	return fetch(url, {
		headers: {
			'X-API-Key': getApiKey(),
			Accept: 'application/json'
		}
	});
}

/** Map Croatian postal-code prefix → županija (approximate, for listing filters). */
export function countyFromPostcode(postCode: number | string | null | undefined): string | null {
	if (postCode == null) return null;
	const digits = String(postCode).replace(/\D/g, '');
	if (digits.length < 2) return null;

	const prefix = digits.slice(0, 2);
	const map: Record<string, string> = {
		'10': 'Grad Zagreb',
		'20': 'Dubrovačko-neretvanska županija',
		'21': 'Splitsko-dalmatinska županija',
		'22': 'Šibensko-kninska županija',
		'23': 'Zadarska županija',
		'31': 'Osječko-baranjska županija',
		'32': 'Vukovarsko-srijemska županija',
		'33': 'Virovitičko-podravska županija',
		'34': 'Požeško-slavonska županija',
		'35': 'Brodsko-posavska županija',
		'40': 'Međimurska županija',
		'42': 'Varaždinska županija',
		'43': 'Bjelovarsko-bilogorska županija',
		'44': 'Sisačko-moslavačka županija',
		'47': 'Karlovačka županija',
		'48': 'Koprivničko-križevačka županija',
		'49': 'Krapinsko-zagorska županija',
		'51': 'Primorsko-goranska županija',
		'52': 'Istarska županija',
		'53': 'Ličko-senjska županija'
	};

	return map[prefix] ?? null;
}

export function formatLibarAddress(detail: LibarAddressDetail): string {
	if (detail.fullAddress?.trim()) return detail.fullAddress.trim();

	const street = [detail.streetName, detail.houseNumber].filter(Boolean).join(' ').trim();
	const postal = detail.postalCode
		? `${detail.postalCode.postCode} ${detail.postalCode.postName}`.trim()
		: '';

	return [street, postal].filter(Boolean).join(', ');
}

export function parsedLocationFromLibar(detail: LibarAddressDetail): ParsedLocation {
	const settlement = detail.settlement?.name?.trim() || null;
	const postName = detail.postalCode?.postName?.trim() || null;

	return {
		county: countyFromPostcode(detail.postalCode?.postCode),
		// Prefer DGU settlement (naselje); fall back to post office name
		city: settlement || postName,
		// Libar has no quarter/neighbourhood field
		neighborhood: null
	};
}

function toGeocodeResult(detail: LibarAddressDetail): GeocodeResult {
	const label = formatLibarAddress(detail);
	return {
		id: detail.gmlId,
		display_name: label,
		short_name: label,
		lat: detail.lat,
		lng: detail.lon
	};
}

export async function searchLibarAddresses(query: string): Promise<GeocodeResult[]> {
	const q = query.trim();
	if (q.length < 5) return [];

	const response = await libarFetch('/api/search', { q });
	if (!response.ok) {
		console.error('Libar search failed:', response.status, await response.text());
		return [];
	}

	const body = (await response.json()) as { data?: LibarSearchHit[] };
	const hits = (body.data ?? []).slice(0, SEARCH_LIMIT);

	// Search hits have no coordinates — return placeholders; client resolves via ?id= on select.
	return hits.map((hit) => ({
		id: hit.gmlId,
		display_name: hit.fullAddress,
		short_name: hit.fullAddress,
		lat: 0,
		lng: 0
	}));
}

export async function getLibarAddress(id: string): Promise<GeocodeResult | null> {
	const trimmed = id.trim();
	if (!trimmed.startsWith('Address.')) return null;

	const response = await libarFetch(`/api/addresses/${encodeURIComponent(trimmed)}`);
	if (!response.ok) {
		console.error('Libar address lookup failed:', response.status, await response.text());
		return null;
	}

	const detail = (await response.json()) as LibarAddressDetail;
	if (!Number.isFinite(detail.lat) || !Number.isFinite(detail.lon)) return null;

	return toGeocodeResult(detail);
}

export async function nearestLibarAddresses(
	lat: number,
	lng: number
): Promise<LibarAddressDetail[]> {
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

	const response = await libarFetch('/api/nearest', {
		lat: String(lat),
		lon: String(lng)
	});

	if (!response.ok) {
		console.error('Libar nearest failed:', response.status, await response.text());
		return [];
	}

	const body = (await response.json()) as { data?: LibarAddressDetail[] };
	return body.data ?? [];
}

export async function reverseLibarGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
	const nearest = await nearestLibarAddresses(lat, lng);
	const best = nearest[0];
	if (!best) return null;
	return toGeocodeResult(best);
}

export async function resolveLibarLocationFromCoords(
	lat: number,
	lng: number
): Promise<ParsedLocation> {
	const nearest = await nearestLibarAddresses(lat, lng);
	const best = nearest[0];
	if (!best) {
		return { county: null, city: null, neighborhood: null };
	}
	return parsedLocationFromLibar(best);
}
