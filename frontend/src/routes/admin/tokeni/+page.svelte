<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatBpPrice } from '$lib/tokens/queries';

	let { data, form } = $props();
</script>

<div class="max-w-xl">
	<h2 class="text-2xl font-bold text-gray-900">BP tokeni</h2>
	<p class="mt-2 text-sm text-gray-600">
		Postavite koliko BP tokena korisnici troše za objavu oglasa i koliko košta kupnja jednog tokena.
	</p>

	{#if form?.success}
		<div class="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
			Postavke su spremljene.
		</div>
	{/if}

	{#if form?.error}
		<div class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance class="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
		<div>
			<label for="sale_listing_bp_cost" class="mb-1.5 block text-sm font-semibold text-gray-700">
				Cijena objave — Prodaja (BP)
			</label>
			<input
				id="sale_listing_bp_cost"
				name="sale_listing_bp_cost"
				type="number"
				min="0"
				required
				value={data.settings.sale_listing_bp_cost}
				class="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-500"
			/>
		</div>

		<div>
			<label for="rent_listing_bp_cost" class="mb-1.5 block text-sm font-semibold text-gray-700">
				Cijena objave — Najam (BP)
			</label>
			<input
				id="rent_listing_bp_cost"
				name="rent_listing_bp_cost"
				type="number"
				min="0"
				required
				value={data.settings.rent_listing_bp_cost}
				class="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-500"
			/>
		</div>

		<div>
			<label for="bp_price_cents" class="mb-1.5 block text-sm font-semibold text-gray-700">
				Cijena kupnje jednog BP tokena (u centima)
			</label>
			<input
				id="bp_price_cents"
				name="bp_price_cents"
				type="number"
				min="1"
				required
				value={data.settings.bp_price_cents}
				class="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-yellow-500"
			/>
			<p class="mt-1 text-xs text-gray-500">
				Trenutno: {formatBpPrice(data.settings.bp_price_cents)} po tokenu
			</p>
		</div>

		<button
			type="submit"
			class="rounded-xl bg-yellow-500 px-5 py-3 font-bold text-white hover:bg-yellow-600"
		>
			Spremi postavke
		</button>
	</form>
</div>
