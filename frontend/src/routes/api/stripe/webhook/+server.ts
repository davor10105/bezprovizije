import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { getStripe } from '$lib/server/stripe';
import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';
import type Stripe from 'stripe';

async function completePurchase(session: Stripe.Checkout.Session) {
	if (!session.id) return;

	const paymentIntentId =
		typeof session.payment_intent === 'string'
			? session.payment_intent
			: session.payment_intent?.id ?? null;

	const admin = getSupabaseAdmin();
	const { error: rpcError } = await admin.rpc('complete_bp_purchase' as never, {
		p_checkout_session_id: session.id,
		p_payment_intent_id: paymentIntentId
	} as never);

	if (rpcError) {
		console.error('complete_bp_purchase failed:', rpcError.message);
		throw rpcError;
	}
}

async function markPurchaseFailed(sessionId: string) {
	const admin = getSupabaseAdmin();
	await admin
		.from('bp_purchases' as never)
		.update({ status: 'failed' } as never)
		.eq('stripe_checkout_session_id', sessionId)
		.eq('status', 'pending');
}

async function markPurchaseExpired(sessionId: string) {
	const admin = getSupabaseAdmin();
	await admin
		.from('bp_purchases' as never)
		.update({ status: 'expired' } as never)
		.eq('stripe_checkout_session_id', sessionId)
		.eq('status', 'pending');
}

export const POST: RequestHandler = async ({ request }) => {
	const stripe = getStripe();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		error(400, 'Missing Stripe signature');
	}

	const payload = await request.text();
	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
	} catch (err) {
		console.error('Stripe webhook signature verification failed:', err);
		error(400, 'Invalid signature');
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				if (session.payment_status === 'paid') {
					await completePurchase(session);
				}
				break;
			}
			case 'checkout.session.async_payment_succeeded': {
				const session = event.data.object as Stripe.Checkout.Session;
				await completePurchase(session);
				break;
			}
			case 'checkout.session.async_payment_failed': {
				const session = event.data.object as Stripe.Checkout.Session;
				await markPurchaseFailed(session.id);
				break;
			}
			case 'checkout.session.expired': {
				const session = event.data.object as Stripe.Checkout.Session;
				await markPurchaseExpired(session.id);
				break;
			}
		}
	} catch (err) {
		console.error('Stripe webhook handler failed:', err);
		error(500, 'Webhook handler failed');
	}

	return text('ok');
};
