import { error, json } from '@sveltejs/kit';
import QRCode from 'qrcode';
import type { RequestHandler } from './$types';
import { getSafeUser, getProfile } from '$lib/auth';
import {
	buildManualBankPaymentPayload,
	getManualBankPaymentConfig
} from '$lib/server/bankPayment';
import { fetchTokenSettings, formatBpPrice, purchaseTotalCents } from '$lib/tokens/queries';

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
	const { user } = await getSafeUser(supabase);
	if (!user) {
		error(401, 'Morate biti prijavljeni.');
	}

	const profile = await getProfile(supabase, user.id);

	const bankConfig = getManualBankPaymentConfig();
	if (!bankConfig) {
		error(503, 'Uplata na IBAN trenutno nije dostupna.');
	}

	const body = (await request.json()) as { bpAmount?: number };
	const bpAmount = Math.floor(Number(body.bpAmount));

	if (!bpAmount || bpAmount < 1 || bpAmount > 100000) {
		error(400, 'Neispravan broj tokena.');
	}

	const settings = await fetchTokenSettings(supabase);
	const amountCents = purchaseTotalCents(settings, bpAmount);
	const purchaseId = crypto.randomUUID();
	const checkoutSessionId = `manual-${purchaseId}`;
	const payerName = profile?.full_name?.trim() ?? '';
	const payerEmail = profile?.email?.trim() ?? user.email?.trim() ?? '';
	const purchaseReference = purchaseId.replace(/-/g, '').slice(0, 22).toUpperCase();

	const hrvHub30Payload = buildManualBankPaymentPayload(bankConfig, {
		amountCents,
		bpAmount,
		payerName,
		payerEmail,
		purchaseReference
	});

	const qrDataUrl = await QRCode.toDataURL(hrvHub30Payload, {
		errorCorrectionLevel: 'M',
		margin: 2,
		width: 280
	});

	const { error: insertError } = await supabase.from('bp_purchases').insert({
		id: purchaseId,
		user_id: user.id,
		bp_amount: bpAmount,
		amount_cents: amountCents,
		payment_method: 'manual_bank',
		stripe_checkout_session_id: checkoutSessionId,
		status: 'pending'
	});

	if (insertError) {
		console.error('manual bp_purchases insert failed:', insertError.message);
		error(500, 'Spremanje narudžbe nije uspjelo.');
	}

	const modelLabel = `HR${bankConfig.referenceModel.padStart(2, '0').slice(-2)}`;

	return json({
		purchaseId,
		bpAmount,
		amountLabel: formatBpPrice(amountCents),
		amountCents,
		payerName,
		payerEmail,
		recipientName: bankConfig.recipientName,
		recipientStreet: bankConfig.recipientStreet,
		recipientCity: bankConfig.recipientCity,
		iban: bankConfig.iban,
		referenceModel: modelLabel,
		reference: purchaseReference,
		purposeCode: bankConfig.purposeCode,
		description: hrvHub30Payload.split('\n').at(-1) ?? '',
		qrDataUrl
	});
};
