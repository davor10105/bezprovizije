<script lang="ts">
	import { formatBpPrice, purchaseTotalCents } from '$lib/tokens/queries';
	import type { BpPaymentMethod } from '$lib/types/tokens';

	let { data } = $props();

	let bpAmount = $state(data.suggestedAmount);
	let paymentMethod = $state<BpPaymentMethod>('card');
	let loading = $state(false);
	let errorMessage = $state('');

	const totalCents = $derived(purchaseTotalCents(data.settings, bpAmount));
	const totalLabel = $derived(formatBpPrice(totalCents));

	async function startCheckout() {
		errorMessage = '';
		loading = true;

		try {
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
			errorMessage = 'Kreiranje plaćanja nije uspjelo. Pokušajte ponovno.';
		} finally {
			loading = false;
		}
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
				class="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
			/>
			<p class="mt-2 text-sm text-gray-500">Cijena po tokenu: {data.bpPriceLabel}</p>
		</div>

		<div>
			<p class="mb-3 text-sm font-semibold text-gray-700">Način plaćanja</p>
			<div class="grid gap-3 sm:grid-cols-3">
				<label
					class="flex cursor-pointer items-center justify-center rounded-xl border-2 px-4 py-4 text-center text-sm font-semibold transition {paymentMethod ===
					'card'
						? 'border-yellow-500 bg-yellow-50 text-yellow-900'
						: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
				>
					<input type="radio" bind:group={paymentMethod} value="card" class="sr-only" />
					Kartica
				</label>
				<label
					class="flex cursor-pointer items-center justify-center rounded-xl border-2 px-4 py-4 text-center text-sm font-semibold transition {paymentMethod ===
					'sepa_debit'
						? 'border-yellow-500 bg-yellow-50 text-yellow-900'
						: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
				>
					<input type="radio" bind:group={paymentMethod} value="sepa_debit" class="sr-only" />
					SEPA izravno terećenje
				</label>
				<label
					class="flex cursor-pointer items-center justify-center rounded-xl border-2 px-4 py-4 text-center text-sm font-semibold transition {paymentMethod ===
					'bank_transfer'
						? 'border-yellow-500 bg-yellow-50 text-yellow-900'
						: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
				>
					<input
						type="radio"
						bind:group={paymentMethod}
						value="bank_transfer"
						class="sr-only"
					/>
					Bankovna uplata
				</label>
			</div>
			{#if paymentMethod === 'bank_transfer'}
				<p class="mt-2 text-xs text-gray-500">
					Tokeni se dodaju na račun nakon što Stripe potvrdi bankovnu uplatu.
				</p>
			{:else if paymentMethod === 'sepa_debit'}
				<p class="mt-2 text-xs text-gray-500">
					Unosite IBAN i odobravate izravno terećenje. Tokeni se dodaju nakon što banka potvrdi
					uplatu (može potrajati nekoliko dana).
				</p>
			{/if}
		</div>

		<div class="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-4">
			<p class="text-sm text-yellow-900">
				Ukupno za plaćanje: <span class="text-lg font-extrabold">{totalLabel}</span>
			</p>
		</div>

		{#if errorMessage}
			<p class="text-sm text-red-600" role="alert">{errorMessage}</p>
		{/if}

		<button
			type="button"
			class="w-full rounded-xl bg-yellow-500 py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
			disabled={loading || bpAmount < 1}
			onclick={startCheckout}
		>
			{loading ? 'Priprema plaćanja...' : 'Nastavi na plaćanje'}
		</button>

		<a
			href={data.redirectTo}
			class="block text-center text-sm font-semibold text-gray-500 hover:text-yellow-600"
		>
			Natrag
		</a>
	</div>
</div>
