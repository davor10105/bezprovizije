import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/auth';
import { fetchTokenSettings, formatBpPrice } from '$lib/tokens/queries';
import { getStripe } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const loginRedirect = '/prijava?action=login&redirect=/kupi-bp';
	const { user, profile } = await requireAuth(supabase, loginRedirect);
	const settings = await fetchTokenSettings(supabase);

	const redirectTo = url.searchParams.get('redirect')?.startsWith('/')
		? url.searchParams.get('redirect')!
		: '/objavi-oglas';

	const suggestedAmount = Math.max(1, Math.floor(Number(url.searchParams.get('amount')) || 10));

	let checkoutMessage: { type: 'success' | 'pending' | 'canceled'; text: string } | null = null;
	const sessionId = url.searchParams.get('session_id');

	if (url.searchParams.get('canceled') === '1') {
		checkoutMessage = {
			type: 'canceled',
			text: 'Plaćanje je otkazano. Možete pokušati ponovno kad god želite.'
		};
	} else if (url.searchParams.get('success') === '1' && sessionId) {
		try {
			const session = await getStripe().checkout.sessions.retrieve(sessionId);
			if (session.payment_status === 'paid') {
				checkoutMessage = {
					type: 'success',
					text: 'Uplata je uspješna. BP tokeni su dodani na vaš račun.'
				};
			} else {
				checkoutMessage = {
					type: 'pending',
					text: 'Uplata je zaprimljena. BP tokeni će biti dodani na vaš račun nakon potvrde uplate.'
				};
			}
		} catch {
			checkoutMessage = {
				type: 'pending',
				text: 'Uplata je u obradi. BP tokeni će biti dodani nakon potvrde uplate.'
			};
		}
	}

	return {
		user,
		profile,
		settings,
		bpPriceLabel: formatBpPrice(settings.bp_price_cents),
		redirectTo,
		suggestedAmount,
		checkoutMessage
	};
};
