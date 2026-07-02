import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSafeUser } from '$lib/auth';
import { getStripe } from '$lib/server/stripe';
import { fetchTokenSettings, purchaseTotalCents } from '$lib/tokens/queries';
import type { BpPaymentMethod } from '$lib/types/tokens';

export const POST: RequestHandler = async ({ request, locals: { supabase }, url }) => {
	const { user } = await getSafeUser(supabase);
	if (!user) {
		error(401, 'Morate biti prijavljeni.');
	}

	const body = (await request.json()) as {
		bpAmount?: number;
		paymentMethod?: BpPaymentMethod;
		redirectTo?: string;
	};

	const bpAmount = Math.floor(Number(body.bpAmount));
	const paymentMethod = body.paymentMethod;
	const redirectTo = body.redirectTo?.startsWith('/') ? body.redirectTo : '/kupi-bp';

	if (!bpAmount || bpAmount < 1 || bpAmount > 1000) {
		error(400, 'Neispravan broj tokena.');
	}

	if (paymentMethod !== 'card' && paymentMethod !== 'bank_transfer') {
		error(400, 'Neispravan način plaćanja.');
	}

	const settings = await fetchTokenSettings(supabase);
	const amountCents = purchaseTotalCents(settings, bpAmount);
	const origin = url.origin;
	const stripe = getStripe();

	const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
		mode: 'payment',
		customer_email: user.email ?? undefined,
		line_items: [
			{
				price_data: {
					currency: 'eur',
					product_data: {
						name: `${bpAmount} BP tokena`,
						description: 'Digitalni tokeni za objavu oglasa na BezProvizije.hr'
					},
					unit_amount: amountCents
				},
				quantity: 1
			}
		],
		success_url: `${origin}/kupi-bp?success=1&session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(redirectTo)}`,
		cancel_url: `${origin}/kupi-bp?canceled=1&redirect=${encodeURIComponent(redirectTo)}`,
		metadata: {
			user_id: user.id,
			bp_amount: String(bpAmount),
			payment_method: paymentMethod
		}
	};

	if (paymentMethod === 'card') {
		sessionParams.payment_method_types = ['card'];
	} else {
		sessionParams.payment_method_types = ['customer_balance'];
		sessionParams.payment_method_options = {
			customer_balance: {
				funding_type: 'bank_transfer',
				bank_transfer: {
					type: 'eu_bank_transfer',
					eu_bank_transfer: {
						country: 'HR'
					}
				}
			}
		};
	}

	const session = await stripe.checkout.sessions.create(sessionParams);

	if (!session.url) {
		error(500, 'Stripe sesija nije kreirana.');
	}

	const { error: insertError } = await supabase.from('bp_purchases').insert({
		user_id: user.id,
		bp_amount: bpAmount,
		amount_cents: amountCents,
		payment_method: paymentMethod,
		stripe_checkout_session_id: session.id,
		status: 'pending'
	});

	if (insertError) {
		console.error('bp_purchases insert failed:', insertError.message);
		error(500, 'Spremanje kupnje nije uspjelo.');
	}

	return json({ url: session.url });
};
