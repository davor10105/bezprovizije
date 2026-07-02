import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingType } from '$lib/types/property';
import type { TokenSettings } from '$lib/types/tokens';

const DEFAULT_TOKEN_SETTINGS: TokenSettings = {
	id: 1,
	sale_listing_bp_cost: 10,
	rent_listing_bp_cost: 5,
	bp_price_cents: 100,
	updated_at: new Date().toISOString()
};

export async function fetchTokenSettings(
	supabase: SupabaseClient
): Promise<TokenSettings> {
	const { data, error } = await supabase
		.from('token_settings')
		.select('id, sale_listing_bp_cost, rent_listing_bp_cost, bp_price_cents, updated_at')
		.eq('id', 1)
		.maybeSingle();

	if (error || !data) {
		console.error('fetchTokenSettings failed:', error?.message);
		return DEFAULT_TOKEN_SETTINGS;
	}

	return data as TokenSettings;
}

export function listingBpCost(settings: TokenSettings, listingType: ListingType): number {
	return listingType === 'sale' ? settings.sale_listing_bp_cost : settings.rent_listing_bp_cost;
}

export function formatBpPrice(cents: number): string {
	return new Intl.NumberFormat('hr-HR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 2
	}).format(cents / 100);
}

export function purchaseTotalCents(settings: TokenSettings, bpAmount: number): number {
	return settings.bp_price_cents * bpAmount;
}
