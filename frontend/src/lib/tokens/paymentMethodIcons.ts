import type { BpPaymentMethod } from '$lib/types/tokens';
import card from '$lib/assets/payment-methods/card.svg?raw';
import sepaDebit from '$lib/assets/payment-methods/sepa-debit.svg?raw';
import bankTransfer from '$lib/assets/payment-methods/bank-transfer.svg?raw';
import manualBank from '$lib/assets/payment-methods/manual-bank.svg?raw';

export const PAYMENT_METHOD_ICON_SVG: Record<BpPaymentMethod, string> = {
	card,
	sepa_debit: sepaDebit,
	bank_transfer: bankTransfer,
	manual_bank: manualBank
};
