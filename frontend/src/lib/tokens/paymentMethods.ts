import type { BpPaymentMethod } from '$lib/types/tokens';

export type PaymentMethodOption = {
	method: BpPaymentMethod;
	label: string;
	/** When BP tokens are expected on the user's account. */
	timing: string;
	requiresManualBankConfig?: boolean;
};

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
	{
		method: 'card',
		label: 'Kartica',
		timing: 'Odmah nakon uspješne uplate'
	},
	{
		method: 'manual_bank',
		label: 'Uplata na IBAN (QR)',
		timing: '1 radni dan nakon potvrde uplate',
		requiresManualBankConfig: true
	},
	{
		method: 'bank_transfer',
		label: 'Online bankovna uplata',
		timing: '1–3 radna dana nakon potvrde uplate'
	},
	{
		method: 'sepa_debit',
		label: 'SEPA izravno terećenje',
		timing: '1 radni dan nakon potvrde banke'
	}
];

export function getAvailablePaymentMethods(manualBankEnabled: boolean): PaymentMethodOption[] {
	return PAYMENT_METHOD_OPTIONS.filter(
		(option) => !option.requiresManualBankConfig || manualBankEnabled
	);
}
