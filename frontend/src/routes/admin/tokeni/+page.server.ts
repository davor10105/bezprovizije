import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/auth';
import { fetchTokenSettings } from '$lib/tokens/queries';

function parsePositiveInt(value: FormDataEntryValue | null, field: string) {
	const num = Number(String(value ?? '').trim());
	if (!Number.isInteger(num) || num < 0) {
		return { error: `${field} mora biti cijeli broj ≥ 0.` };
	}
	return { value: num };
}

function parsePositivePriceCents(value: FormDataEntryValue | null) {
	const num = Number(String(value ?? '').trim());
	if (!Number.isInteger(num) || num <= 0) {
		return { error: 'Cijena po tokenu mora biti veća od 0.' };
	}
	return { value: num };
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	await requireAdmin(supabase);
	const settings = await fetchTokenSettings(supabase);
	return { settings };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		await requireAdmin(supabase);
		const formData = await request.formData();

		const sale = parsePositiveInt(formData.get('sale_listing_bp_cost'), 'Cijena prodaje');
		if ('error' in sale) return fail(400, { error: sale.error });

		const rent = parsePositiveInt(formData.get('rent_listing_bp_cost'), 'Cijena najma');
		if ('error' in rent) return fail(400, { error: rent.error });

		const price = parsePositivePriceCents(formData.get('bp_price_cents'));
		if ('error' in price) return fail(400, { error: price.error });

		const { error } = await supabase
			.from('token_settings')
			.update({
				sale_listing_bp_cost: sale.value,
				rent_listing_bp_cost: rent.value,
				bp_price_cents: price.value,
				updated_at: new Date().toISOString()
			})
			.eq('id', 1);

		if (error) {
			console.error('token_settings update failed:', error.message);
			return fail(500, { error: 'Spremanje postavki nije uspjelo.' });
		}

		return { success: true };
	}
};
