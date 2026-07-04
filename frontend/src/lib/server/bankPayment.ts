import { env } from '$env/dynamic/private';
import { buildHrvHub30Payload, type HrvHub30Payment } from '$lib/tokens/hrvHub30';

export type ManualBankPaymentConfig = {
	iban: string;
	recipientName: string;
	recipientStreet: string;
	recipientCity: string;
	referenceModel: string;
	purposeCode: string;
};

export function getManualBankPaymentConfig(): ManualBankPaymentConfig | null {
	const iban = env.BANK_PAYMENT_IBAN?.replace(/\s/g, '').toUpperCase();
	const recipientName = env.BANK_PAYMENT_RECIPIENT_NAME?.trim();
	const recipientStreet = env.BANK_PAYMENT_RECIPIENT_STREET?.trim();
	const recipientCity = env.BANK_PAYMENT_RECIPIENT_CITY?.trim();

	if (!iban || !recipientName || !recipientStreet || !recipientCity) {
		return null;
	}

	return {
		iban,
		recipientName,
		recipientStreet,
		recipientCity,
		referenceModel: env.BANK_PAYMENT_REFERENCE_MODEL?.trim() || '00',
		purposeCode: env.BANK_PAYMENT_PURPOSE_CODE?.trim() || 'COST'
	};
}

export function isManualBankPaymentConfigured(): boolean {
	return getManualBankPaymentConfig() !== null;
}

type BuildManualPaymentPayloadInput = {
	amountCents: number;
	bpAmount: number;
	payerName: string;
	payerEmail: string;
	purchaseReference: string;
};

export function buildManualBankPaymentPayload(
	config: ManualBankPaymentConfig,
	input: BuildManualPaymentPayloadInput
): string {
	const descriptionParts = [
		`BP ${input.bpAmount}`,
		input.payerName || input.payerEmail
	].filter(Boolean);
	let description = descriptionParts.join(' - ');
	if (input.payerEmail && !description.includes(input.payerEmail)) {
		const withEmail = `${description} ${input.payerEmail}`;
		description = withEmail.length <= 35 ? withEmail : input.payerEmail.slice(0, 35);
	}

	const payment: HrvHub30Payment = {
		amountCents: input.amountCents,
		payerName: input.payerName,
		recipientName: config.recipientName,
		recipientStreet: config.recipientStreet,
		recipientCity: config.recipientCity,
		recipientIban: config.iban,
		referenceModel: config.referenceModel,
		reference: input.purchaseReference,
		purposeCode: config.purposeCode,
		description
	};

	return buildHrvHub30Payload(payment);
}
