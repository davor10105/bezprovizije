-- Add SEPA Direct Debit as a supported BP purchase payment method
alter type public.bp_payment_method add value if not exists 'sepa_debit';
