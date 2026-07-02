export type TokenSettings = {
	id: number;
	sale_listing_bp_cost: number;
	rent_listing_bp_cost: number;
	bp_price_cents: number;
	updated_at: string;
};

export type BpPaymentMethod = 'card' | 'bank_transfer';

export type BpPurchaseStatus = 'pending' | 'completed' | 'failed' | 'expired';

export type BpPurchase = {
	id: string;
	user_id: string;
	bp_amount: number;
	amount_cents: number;
	payment_method: BpPaymentMethod;
	stripe_checkout_session_id: string;
	stripe_payment_intent_id: string | null;
	status: BpPurchaseStatus;
	created_at: string;
	completed_at: string | null;
};
