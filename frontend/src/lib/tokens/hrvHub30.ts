export type HrvHub30Payment = {
	currency?: string;
	/** Total amount in euro cents. */
	amountCents: number;
	payerName?: string;
	payerStreet?: string;
	payerCity?: string;
	recipientName: string;
	recipientStreet: string;
	recipientCity: string;
	recipientIban: string;
	/** Two-digit model, e.g. "00" for HR00. */
	referenceModel?: string;
	reference?: string;
	purposeCode?: string;
	description: string;
};

function truncate(value: string, maxLength: number): string {
	return value.trim().slice(0, maxLength);
}

/** Formats cents as HRVHUB30 amount field (15 chars, comma decimal separator). */
export function formatHrvHub30Amount(amountCents: number): string {
	const whole = Math.floor(amountCents / 100);
	const fraction = amountCents % 100;
	const formatted = `${whole},${String(fraction).padStart(2, '0')}`;
	return formatted.padStart(15, '0');
}

export function buildHrvHub30Payload(payment: HrvHub30Payment): string {
	const model = payment.referenceModel?.padStart(2, '0').slice(-2) ?? '00';

	const lines = [
		'HRVHUB30',
		truncate(payment.currency ?? 'EUR', 3),
		formatHrvHub30Amount(payment.amountCents),
		truncate(payment.payerName ?? '', 30),
		truncate(payment.payerStreet ?? '', 27),
		truncate(payment.payerCity ?? '', 27),
		truncate(payment.recipientName, 25),
		truncate(payment.recipientStreet, 25),
		truncate(payment.recipientCity, 27),
		truncate(payment.recipientIban.replace(/\s/g, '').toUpperCase(), 21),
		`HR${model}`,
		truncate(payment.reference ?? '', 22),
		truncate(payment.purposeCode ?? 'COST', 4),
		truncate(payment.description, 35)
	];

	return lines.join('\n');
}
