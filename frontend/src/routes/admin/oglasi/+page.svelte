<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Pagination from '$lib/Pagination.svelte';

	let { data, form } = $props();

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);

	const statusLabel = {
		pending: 'Na čekanju',
		approved: 'Odobren',
		rejected: 'Odbijen'
	} as const;
</script>

<svelte:head>
	<title>Oglasi | Administracija</title>
</svelte:head>

<p class="text-gray-600">Odobrite ili odbijte oglase prije objave na stranici.</p>

{#if data.error}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{data.error}</p>
{/if}

{#if form?.message}
	<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
{/if}

<section class="mt-8">
	<h2 class="text-lg font-bold text-gray-900">
		Na čekanju
		<span class="text-sm font-normal text-gray-500">({data.pendingPagination.total})</span>
	</h2>

	{#if data.pending.length === 0}
		<p class="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
			Nema oglasa koji čekaju odobrenje.
		</p>
	{:else}
		<div class="mt-4 space-y-4">
			{#each data.pending as listing (listing.id)}
				<article
					class="flex flex-col gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/40 p-4 sm:flex-row sm:items-center"
				>
					<img
						src={listing.image}
						alt=""
						class="h-28 w-full rounded-xl object-cover sm:w-40"
					/>
					<div class="min-w-0 flex-1">
						<h3 class="font-bold text-gray-900">{listing.title}</h3>
						<p class="mt-1 text-sm text-gray-600">{listing.address}</p>
						<p class="mt-2 text-sm text-gray-500">
							{listing.type} · {listing.listingType} · {listing.sqm} m² ·
							<span class="font-semibold text-yellow-700">{formatPrice(listing.price)}</span>
						</p>
						<p class="mt-1 text-xs text-gray-500">
							Oglašivač: {listing.ownerName} ·
							{new Date(listing.created_at).toLocaleDateString('hr-HR')}
						</p>
					</div>
					<div class="flex shrink-0 flex-col gap-2 sm:w-36">
						<form
							method="POST"
							action="?/approve"
							use:enhance={() => async ({ update }) => {
								await update();
								await invalidateAll();
							}}
						>
							<input type="hidden" name="id" value={listing.id} />
							<button
								type="submit"
								class="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
							>
								Odobri
							</button>
						</form>
						<form
							method="POST"
							action="?/reject"
							use:enhance={() => async ({ update }) => {
								await update();
								await invalidateAll();
							}}
						>
							<input type="hidden" name="id" value={listing.id} />
							<button
								type="submit"
								class="w-full rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
							>
								Odbij
							</button>
						</form>
						<a
							href="/nekretnina/{listing.id}"
							class="text-center text-xs font-medium text-gray-600 underline hover:text-yellow-700"
						>
							Pregled
						</a>
					</div>
				</article>
			{/each}
		</div>

		<Pagination
			currentPage={data.pendingPagination.page}
			totalPages={data.pendingPagination.totalPages}
			paramName="pendingPage"
		/>
	{/if}
</section>

<section class="mt-12">
	<h2 class="text-lg font-bold text-gray-900">
		Ostali oglasi
		<span class="text-sm font-normal text-gray-500">({data.otherPagination.total})</span>
	</h2>

	{#if data.other.length === 0}
		<p class="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
			Nema odobrenih oglasa.
		</p>
	{:else}
		<div class="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
			<table class="min-w-full text-sm">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Naslov</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Oglašivač</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
						<th class="px-4 py-3 text-left font-semibold text-gray-700">Akcije</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.other as listing (listing.id)}
						<tr>
							<td class="px-4 py-3">
								<a
									href="/nekretnina/{listing.id}"
									class="font-medium text-gray-900 hover:text-yellow-700">{listing.title}</a
								>
							</td>
							<td class="px-4 py-3 text-gray-600">{listing.ownerName}</td>
							<td class="px-4 py-3">
								<span
									class="rounded-full px-2.5 py-1 text-xs font-semibold {listing.approval_status ===
									'approved'
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}"
								>
									{statusLabel[listing.approval_status]}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex gap-2">
									{#if listing.approval_status !== 'approved'}
										<form
											method="POST"
											action="?/approve"
											use:enhance={() => async ({ update }) => {
												await update();
												await invalidateAll();
											}}
										>
											<input type="hidden" name="id" value={listing.id} />
											<button
												type="submit"
												class="text-xs font-semibold text-green-700 hover:underline"
												>Odobri</button
											>
										</form>
									{/if}
									{#if listing.approval_status !== 'rejected'}
										<form
											method="POST"
											action="?/reject"
											use:enhance={() => async ({ update }) => {
												await update();
												await invalidateAll();
											}}
										>
											<input type="hidden" name="id" value={listing.id} />
											<button
												type="submit"
												class="text-xs font-semibold text-red-700 hover:underline"
												>Odbij</button
											>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<Pagination
			currentPage={data.otherPagination.page}
			totalPages={data.otherPagination.totalPages}
			paramName="otherPage"
		/>
	{/if}
</section>
