import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getLibarAddress,
	reverseLibarGeocode,
	searchLibarAddresses
} from '$lib/server/libar';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id')?.trim();
		if (id) {
			const detail = await getLibarAddress(id);
			return json(detail ? [detail] : []);
		}

		const lat = url.searchParams.get('lat');
		const lng = url.searchParams.get('lng');

		if (lat && lng) {
			const result = await reverseLibarGeocode(Number(lat), Number(lng));
			return json(result ? [result] : []);
		}

		const query = url.searchParams.get('q')?.trim();

		if (!query || query.length < 5) {
			return json([]);
		}

		const results = await searchLibarAddresses(query);
		return json(results);
	} catch (error) {
		console.error('Geocode failed:', error instanceof Error ? error.message : error);
		return json([], { status: 502 });
	}
};
