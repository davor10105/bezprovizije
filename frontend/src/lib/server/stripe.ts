import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
	if (!stripeClient) {
		stripeClient = new Stripe(STRIPE_SECRET_KEY);
	}

	return stripeClient;
}
