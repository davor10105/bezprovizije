<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ApprovalStatus } from '$lib/types/property';
	import type { SubmitFunction } from '@sveltejs/kit';

	type AccountTab = 'listings' | 'favorites' | 'account';

	let { data, form } = $props();

	const formErrors = $derived((form?.errors ?? {}) as Record<string, string>);

	let loading = $state(false);
	let deletingId = $state<string | null>(null);
	let removingFavoriteId = $state<string | null>(null);
	let activeTab = $state<AccountTab>(data.defaultTab as AccountTab);

	const statusLabels: Record<ApprovalStatus, string> = {
		pending: 'Na čekanju',
		approved: 'Odobren',
		rejected: 'Odbijen'
	};

	const statusClasses: Record<ApprovalStatus, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		approved: 'bg-green-100 text-green-800',
		rejected: 'bg-red-100 text-red-800'
	};

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			loading = false;
			await update();
			if (result.type === 'success') {
				await invalidateAll();
				if (data.needsSetup) {
					activeTab = 'listings';
				}
			}
		};
	};

	const handleSignOut: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};

	const handleDeleteListing: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			loading = false;
			deletingId = null;
			await update();
			if (result.type === 'success') {
				await invalidateAll();
			}
		};
	};

	const handleRemoveFavorite: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			loading = false;
			removingFavoriteId = null;
			await update({ reset: false });
			if (result.type === 'success') {
				await invalidateAll();
			}
		};
	};

	function formatPrice(price: number, listingType: string) {
		const formatted = new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);
		return listingType === 'rent' ? `${formatted} / mj.` : formatted;
	}
</script>

<svelte:head>
	<title>{data.needsSetup ? 'Postavljanje računa' : 'Moj račun'} | BezProvizije.hr</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12 md:px-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-3xl font-extrabold text-gray-900">
				{#if data.needsSetup}
					Dovršite <span class="text-yellow-500">postavljanje računa</span>
				{:else}
					Moj <span class="text-yellow-500">račun</span>
				{/if}
			</h1>
			<p class="mt-2 text-sm text-gray-600">
				{#if data.needsSetup}
					Unesite kontakt podatke koji će se prikazivati na vašim oglasima.
				{:else}
					Upravljajte oglasima i podacima profila.
				{/if}
			</p>
		</div>

		{#if data.profile?.role === 'admin'}
			<a
				href="/admin"
				class="inline-flex items-center rounded-lg bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-200"
			>
				Administracija
			</a>
		{/if}
	</div>

	<nav class="mt-8 flex gap-2 border-b border-gray-200" aria-label="Sekcije računa">
		<button
			type="button"
			class="border-b-2 px-4 py-2 text-sm font-semibold transition {activeTab === 'listings'
				? 'border-yellow-500 text-yellow-700'
				: 'border-transparent text-gray-600 hover:text-gray-900'}"
			onclick={() => (activeTab = 'listings')}
		>
			Moji oglasi
			{#if data.listings.length > 0}
				<span class="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
					{data.listings.length}
				</span>
			{/if}
		</button>
		<button
			type="button"
			class="border-b-2 px-4 py-2 text-sm font-semibold transition {activeTab === 'favorites'
				? 'border-yellow-500 text-yellow-700'
				: 'border-transparent text-gray-600 hover:text-gray-900'}"
			onclick={() => (activeTab = 'favorites')}
		>
			Favoriti
			{#if data.favorites.length > 0}
				<span class="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
					{data.favorites.length}
				</span>
			{/if}
		</button>
		<button
			type="button"
			class="border-b-2 px-4 py-2 text-sm font-semibold transition {activeTab === 'account'
				? 'border-yellow-500 text-yellow-700'
				: 'border-transparent text-gray-600 hover:text-gray-900'}"
			onclick={() => (activeTab = 'account')}
		>
			Moj račun
		</button>
	</nav>

	{#if activeTab === 'listings'}
		<section class="mt-8">
			{#if data.deleted || form?.deletedListing}
				<div class="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
					Oglas je uspješno obrisan.
				</div>
			{/if}

			{#if data.needsSetup}
				<div class="rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-10 text-center">
					<p class="text-sm text-yellow-900">
						Prije objave oglasa dovršite postavljanje računa u kartici
						<button
							type="button"
							class="font-semibold underline hover:text-yellow-700"
							onclick={() => (activeTab = 'account')}
						>
							Moj račun
						</button>.
					</p>
				</div>
			{:else}
				<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
					<p class="text-sm text-gray-600">
						Pregled svih vaših oglasa — odobrenih, na čekanju i odbijenih.
					</p>
					<a
						href="/objavi-oglas"
						class="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400"
					>
						+ Novi oglas
					</a>
				</div>

				{#if data.listings.length === 0}
					<div
						class="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center"
					>
						<p class="text-sm text-gray-600">Još nemate objavljenih oglasa.</p>
						<a
							href="/objavi-oglas"
							class="mt-4 inline-block text-sm font-semibold text-yellow-600 hover:text-yellow-700"
						>
							Objavite prvi oglas
						</a>
					</div>
				{:else}
					<ul class="space-y-4">
						{#each data.listings as listing (listing.id)}
							<li
								class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
							>
								<img
									src={listing.image}
									alt={listing.title}
									class="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-36"
								/>
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-center gap-2">
										<h3 class="font-semibold text-gray-900">{listing.title}</h3>
										<span
											class="rounded-full px-2.5 py-0.5 text-xs font-semibold {statusClasses[
												listing.approval_status
											]}"
										>
											{statusLabels[listing.approval_status]}
										</span>
									</div>
									<p class="mt-1 text-sm text-gray-500 line-clamp-1">{listing.address}</p>
									<p class="mt-1 text-sm font-semibold text-gray-800">
										{formatPrice(listing.price, listing.listing_type)}
										<span class="font-normal text-gray-500">
											· {data.propertyTypeConfig[listing.property_type].label}
										</span>
									</p>
								</div>
								<div class="flex flex-wrap gap-2 sm:flex-col">
									<a
										href="/nekretnina/{listing.id}"
										class="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
									>
										Pregled
									</a>
									<a
										href="/uredi-oglas/{listing.id}"
										class="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-center text-sm font-medium text-yellow-800 hover:bg-yellow-100"
									>
										Uredi
									</a>
									{#if deletingId === listing.id}
										<form
											method="post"
											action="?/deleteListing"
											use:enhance={handleDeleteListing}
											class="contents"
										>
											<input type="hidden" name="listingId" value={listing.id} />
											<button
												type="submit"
												disabled={loading}
												class="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
											>
												Potvrdi
											</button>
											<button
												type="button"
												class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
												onclick={() => (deletingId = null)}
											>
												Odustani
											</button>
										</form>
									{:else}
										<button
											type="button"
											class="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
											onclick={() => (deletingId = listing.id)}
										>
											Obriši
										</button>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</section>
	{:else if activeTab === 'favorites'}
		<section class="mt-8">
			{#if form?.removedFavorite}
				<div class="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
					Oglas je uklonjen iz favorita.
				</div>
			{/if}

			{#if data.favorites.length === 0}
				<div
					class="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-10 text-center"
				>
					<p class="text-sm text-gray-600">Još nemate spremljenih oglasa.</p>
					<a
						href="/pretraga"
						class="mt-4 inline-block text-sm font-semibold text-yellow-600 hover:text-yellow-700"
					>
						Pretražite nekretnine
					</a>
				</div>
			{:else}
				<ul class="space-y-4">
					{#each data.favorites as listing (listing.id)}
						<li
							class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
						>
							<a href="/nekretnina/{listing.id}" class="shrink-0">
								<img
									src={listing.image}
									alt={listing.title}
									class="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-36"
								/>
							</a>
							<div class="min-w-0 flex-1">
								<a href="/nekretnina/{listing.id}">
									<h3 class="font-semibold text-gray-900 hover:text-yellow-700">{listing.title}</h3>
								</a>
								<p class="mt-1 text-sm text-gray-500 line-clamp-1">{listing.address}</p>
								<p class="mt-1 text-sm font-semibold text-gray-800">
									{formatPrice(listing.price, listing.listing_type)}
									<span class="font-normal text-gray-500">
										· {data.propertyTypeConfig[listing.property_type].label}
									</span>
								</p>
							</div>
							<div class="flex flex-wrap gap-2 sm:flex-col">
								<a
									href="/nekretnina/{listing.id}"
									class="rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
								>
									Pregled
								</a>
								{#if removingFavoriteId === listing.id}
									<form
										method="post"
										action="?/removeFavorite"
										use:enhance={handleRemoveFavorite}
										class="contents"
									>
										<input type="hidden" name="listingId" value={listing.id} />
										<button
											type="submit"
											disabled={loading}
											class="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
										>
											Potvrdi
										</button>
										<button
											type="button"
											class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
											onclick={() => (removingFavoriteId = null)}
										>
											Odustani
										</button>
									</form>
								{:else}
									<button
										type="button"
										class="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
										onclick={() => (removingFavoriteId = listing.id)}
									>
										Ukloni
									</button>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else}
		<section class="mt-8">
			{#if form?.success}
				<div class="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
					{data.needsSetup
						? 'Profil je spremljen. Sada možete koristiti platformu.'
						: 'Podaci su uspješno spremljeni.'}
				</div>
			{/if}

			{#if formErrors.form}
				<div class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
					{formErrors.form}
				</div>
			{/if}

			<form
				class="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50"
				method="post"
				action="?/update"
				use:enhance={handleSubmit}
			>
				<div>
					<label for="email" class="block text-sm font-semibold text-gray-700">Email adresa</label>
					<input
						id="email"
						type="email"
						value={data.email ?? ''}
						disabled
						class="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 sm:text-sm"
					/>
				</div>

				<div>
					<label for="fullName" class="block text-sm font-semibold text-gray-700">Ime i prezime</label>
					<input
						id="fullName"
						name="fullName"
						type="text"
						autocomplete="name"
						required
						value={form?.fullName ?? data.profile?.full_name ?? ''}
						class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
						placeholder="Ivan Horvat"
					/>
					{#if formErrors.fullName}
						<p class="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
					{/if}
				</div>

				<div>
					<label for="phone" class="block text-sm font-semibold text-gray-700">Broj telefona</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						autocomplete="tel"
						required
						value={form?.phone ?? data.profile?.phone ?? ''}
						class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
						placeholder="+385 91 234 5678"
					/>
					{#if formErrors.phone}
						<p class="mt-1 text-sm text-red-600">{formErrors.phone}</p>
					{/if}
				</div>

				{#if !data.needsSetup}
					<div>
						<span class="block text-sm font-semibold text-gray-700">Uloga</span>
						<p class="mt-1.5 text-sm text-gray-600">
							{data.profile?.role === 'admin' ? 'Administrator' : 'Korisnik'}
						</p>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-gray-800 disabled:opacity-60"
				>
					{loading ? 'Spremanje...' : data.needsSetup ? 'Spremi i nastavi' : 'Spremi promjene'}
				</button>
			</form>

			{#if !data.needsSetup}
				<form method="post" action="?/signout" use:enhance={handleSignOut} class="mt-6">
					<button
						type="submit"
						disabled={loading}
						class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
					>
						Odjava
					</button>
				</form>
			{/if}
		</section>
	{/if}
</div>
