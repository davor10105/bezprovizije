<script lang="ts">
	import { formatBpPrice, purchaseTotalCents } from '$lib/tokens/queries';
	import PaymentMethodIcon from '$lib/tokens/PaymentMethodIcon.svelte';
	import { getAvailablePaymentMethods } from '$lib/tokens/paymentMethods';
	import type { BpPaymentMethod } from '$lib/types/tokens';

	type ManualPaymentDetails = {
		purchaseId: string;
		bpAmount: number;
		amountLabel: string;
		payerName: string;
		payerEmail: string;
		recipientName: string;
		recipientStreet: string;
		recipientCity: string;
		iban: string;
		referenceModel: string;
		reference: string;
		purposeCode: string;
		description: string;
		qrDataUrl: string;
	};

	let { data } = $props();

	let bpAmount = $state(data.suggestedAmount);
	let paymentMethod = $state<BpPaymentMethod>('card');
	let loading = $state(false);
	let errorMessage = $state('');
	let manualPayment = $state<ManualPaymentDetails | null>(null);

	const totalCents = $derived(purchaseTotalCents(data.settings, bpAmount));
	const totalLabel = $derived(formatBpPrice(totalCents));
	const isManualBank = $derived(paymentMethod === 'manual_bank');
	const paymentOptions = $derived(getAvailablePaymentMethods(data.manualBankPaymentEnabled));

	async function startCheckout() {
		errorMessage = '';
		manualPayment = null;
		loading = true;

		try {
			if (isManualBank) {
				const response = await fetch('/api/bp/manual-bank', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ bpAmount })
				});

				const payload = await response.json();

				if (!response.ok) {
					errorMessage = payload.message ?? 'Generiranje podataka za uplatu nije uspjelo.';
					return;
				}

				manualPayment = payload as ManualPaymentDetails;
				return;
			}

			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bpAmount,
					paymentMethod,
					redirectTo: data.redirectTo
				})
			});

			const payload = await response.json();

			if (!response.ok) {
				errorMessage = payload.message ?? 'Kreiranje plaćanja nije uspjelo.';
				return;
			}

			window.location.href = payload.url;
		} catch {
			errorMessage = isManualBank
				? 'Generiranje podataka za uplatu nije uspjelo. Pokušajte ponovno.'
				: 'Kreiranje plaćanja nije uspjelo. Pokušajte ponovno.';
		} finally {
			loading = false;
		}
	}

	function onPaymentMethodChange() {
		errorMessage = '';
		manualPayment = null;
	}

	function downloadQrCode() {
		if (!manualPayment) return;

		const link = document.createElement('a');
		link.href = manualPayment.qrDataUrl;
		link.download = `uplata-bp-${manualPayment.bpAmount}-${manualPayment.purchaseId.slice(0, 8)}.png`;
		link.click();
	}
</script>

<svelte:head>
	<title>Kupi BP tokene | BezProvizije.hr</title>
</svelte:head>

<div class="mx-auto max-w-xl px-4 py-10 md:px-8">
	<h1 class="text-3xl font-extrabold text-gray-900">
		Kupi <span class="text-yellow-500">BP</span> tokene
	</h1>
	<p class="mt-2 text-gray-600">
		Trenutno stanje: <span class="font-bold text-gray-900">{data.profile?.bp_balance ?? 0} BP</span>
	</p>

	{#if data.checkoutMessage}
		<div
			class="mt-6 rounded-xl px-4 py-3 text-sm {data.checkoutMessage.type === 'success'
				? 'bg-green-50 text-green-800'
				: data.checkoutMessage.type === 'pending'
					? 'bg-yellow-50 text-yellow-900'
					: 'bg-gray-100 text-gray-700'}"
			role="status"
		>
			{data.checkoutMessage.text}
		</div>
	{/if}

	<div class="mt-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
		<div>
			<label for="bpAmount" class="mb-2 block text-sm font-semibold text-gray-700"
				>Količina tokena (BP)</label
			>
			<input
				id="bpAmount"
				type="number"
				min="1"
				max="100000"
				bind:value={bpAmount}
				onchange={() => {
					manualPayment = null;
				}}
				class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
			/>
			<p class="mt-2 text-sm text-gray-500">Cijena po tokenu: {data.bpPriceLabel}</p>
		</div>

		<div>
			<p class="mb-3 text-sm font-semibold text-gray-700">Način plaćanja</p>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each paymentOptions as option (option.method)}
					{@const selected = paymentMethod === option.method}
					<label
						class="flex cursor-pointer flex-col items-center rounded-xl border-2 px-4 py-4 text-center transition {selected
							? 'border-yellow-500 bg-yellow-50 text-yellow-900'
							: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
					>
						<input
							type="radio"
							bind:group={paymentMethod}
							value={option.method}
							class="sr-only"
							onchange={onPaymentMethodChange}
						/>
						<PaymentMethodIcon
							method={option.method}
							class="h-9 w-9 {selected ? 'text-yellow-600' : 'text-yellow-500/70'}"
						/>
						<span class="mt-2 text-sm font-semibold">{option.label}</span>
						<span
							class="mt-1 text-xs leading-snug {selected
								? 'text-yellow-800/80'
								: 'font-normal text-gray-500'}"
						>
							{option.timing}
						</span>
					</label>
				{/each}
			</div>
		</div>

		<div class="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-4">
			<p class="text-sm text-yellow-900">
				Ukupno za plaćanje: <span class="text-lg font-extrabold">{totalLabel}</span>
			</p>
		</div>

		{#if errorMessage}
			<p class="text-sm text-red-600" role="alert">{errorMessage}</p>
		{/if}

		{#if manualPayment}
			<div class="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
				<div class="text-center">
					<p class="text-sm font-semibold text-gray-700">
						Skenirajte QR kod u bankarskoj aplikaciji
					</p>
					<img
						src={manualPayment.qrDataUrl}
						alt="QR kod za bankovnu uplatu"
						class="mx-auto mt-4 rounded-xl border border-white bg-white p-3 shadow-sm"
						width="280"
						height="280"
					/>
					<button
						type="button"
						class="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-yellow-500 bg-white px-4 py-2.5 text-sm font-semibold text-yellow-700 shadow-sm transition hover:bg-yellow-50"
						onclick={downloadQrCode}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
						Preuzmi QR kod
					</button>
				</div>

				<dl class="space-y-2 text-sm">
					<div class="flex justify-between gap-4 border-b border-gray-200 pb-2">
						<dt class="text-gray-500">Primatelj</dt>
						<dd class="text-right font-medium text-gray-900">{manualPayment.recipientName}</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-gray-200 pb-2">
						<dt class="text-gray-500">IBAN</dt>
						<dd class="text-right font-mono text-xs font-medium text-gray-900 sm:text-sm">
							{manualPayment.iban}
						</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-gray-200 pb-2">
						<dt class="text-gray-500">Iznos</dt>
						<dd class="text-right font-bold text-gray-900">{manualPayment.amountLabel}</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-gray-200 pb-2">
						<dt class="text-gray-500">Model i poziv na broj</dt>
						<dd class="text-right font-mono text-xs text-gray-900 sm:text-sm">
							{manualPayment.referenceModel}
							{manualPayment.reference}
						</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-gray-200 pb-2">
						<dt class="text-gray-500">Šifra namjene</dt>
						<dd class="text-right text-gray-900">{manualPayment.purposeCode}</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-gray-200 pb-2">
						<dt class="text-gray-500">Opis plaćanja</dt>
						<dd class="max-w-[60%] text-right text-gray-900">{manualPayment.description}</dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-gray-500">Platitelj</dt>
						<dd class="max-w-[60%] text-right text-gray-900">
							{manualPayment.payerName || manualPayment.payerEmail}
							{#if manualPayment.payerName && manualPayment.payerEmail}
								<br /><span class="text-xs text-gray-500">{manualPayment.payerEmail}</span>
							{/if}
						</dd>
					</div>
				</dl>

				<p class="rounded-xl bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
					Nakon uplate, BP tokeni ({manualPayment.bpAmount} BP) bit će dodani na Vaš račun kad primimo
					potvrdu uplate. Referenca narudžbe:
					<span class="font-mono">{manualPayment.purchaseId.slice(0, 8)}</span>.
				</p>
			</div>
		{/if}

		<button
			type="button"
			class="w-full rounded-xl bg-yellow-500 py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
			disabled={loading || bpAmount < 1}
			onclick={startCheckout}
		>
			{#if loading}
				{isManualBank ? 'Generiranje QR koda...' : 'Priprema plaćanja...'}
			{:else if isManualBank && manualPayment}
				Osvježi QR kod
			{:else if isManualBank}
				Prikaži podatke za uplatu
			{:else}
				Nastavi na plaćanje
			{/if}
		</button>

		<a
			href={data.redirectTo}
			class="block text-center text-sm font-semibold text-gray-500 hover:text-yellow-600"
		>
			Natrag
		</a>
	</div>
</div>
