-- Manual bank transfer (HRVHUB30 QR) and SEPA debit payment methods
alter type public.bp_payment_method add value if not exists 'sepa_debit';
alter type public.bp_payment_method add value if not exists 'manual_bank';
