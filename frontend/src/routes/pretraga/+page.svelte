<script lang="ts">
	let { data } = $props();

	const listings = data.listings;

	const dodatneSpecifikacije: Record<string, string[]> = {
		heating: ['Klima', 'Podno', 'Struja', 'Plinsko etažno', 'Dizalica topline'],
		property_condition: ['Novogradnja', 'Za adaptaciju', 'Odlično', 'Renovirano', 'Dobro'],
		energy_class: ['A+', 'A', 'B', 'C', 'D', 'E', 'F']
	};

	const filterLabels: Record<string, string> = {
		heating: 'Način grijanja',
		property_condition: 'Stanje nekretnine',
		energy_class: 'Energetski razred'
	};
	// const listings = [
	// 	{
	// 		id: 1,
	// 		title: 'Trosoban stan sa vrtom. Novogradnja, useljivo odmah',
	// 		location: 'Splitsko-dalmatinska, Solin',
	// 		price: 399000,
	// 		sqm: 84,
	// 		type: 'Stan',
	// 		status: 'sale',
	// 		rooms: 3,
	// 		bathrooms: 2,
	// 		dateAvailable: '29. travnja 2026.',
	// 		dateAdded: '2026-04-20', // Za sortiranje (Najnovije)
	// 		image:
	// 			'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
	// 		attributes: {
	// 			'Način grijanja': 'Podno',
	// 			'Stanje nekretnine': 'Novogradnja',
	// 			Parking: 'Garaža',
	// 			'Energetski razred': 'A+'
	// 		}
	// 	},
	// 	{
	// 		id: 2,
	// 		title: 'Luksuzan dvosoban stan u centru',
	// 		location: 'Grad Zagreb, Donji Grad',
	// 		price: 1200,
	// 		sqm: 65,
	// 		type: 'Stan',
	// 		status: 'rent',
	// 		rooms: 2,
	// 		bathrooms: 1,
	// 		dateAvailable: 'Odmah',
	// 		dateAdded: '2026-04-15',
	// 		image:
	// 			'https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&w=800&q=80',
	// 		attributes: {
	// 			'Način grijanja': 'Plinsko etažno',
	// 			'Stanje nekretnine': 'Renovirano',
	// 			Parking: 'Nema',
	// 			'Energetski razred': 'B'
	// 		}
	// 	},
	// 	{
	// 		id: 3,
	// 		title: 'Obiteljska kuća s bazenom',
	// 		location: 'Istarska, Rovinj',
	// 		price: 850000,
	// 		sqm: 210,
	// 		type: 'Kuća',
	// 		status: 'sale',
	// 		rooms: 5,
	// 		bathrooms: 3,
	// 		dateAvailable: '1. lipnja 2026.',
	// 		dateAdded: '2026-04-28',
	// 		image:
	// 			'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
	// 		attributes: {
	// 			'Način grijanja': 'Dizalica topline',
	// 			'Stanje nekretnine': 'Odlično',
	// 			Parking: 'Vanjsko ne-natkriveno',
	// 			'Energetski razred': 'A'
	// 		}
	// 	}
	// ];

	// --- STATE ZA FILTERE I SORTIRANJE ---
	let mobileFiltersOpen = $state(false);

	// Sortiranje: zadano je najnovije
	let sortBy = $state('newest'); // 'newest', 'oldest', 'price_asc', 'price_desc'

	let filters = $state({
		status: 'all',
		type: 'all',
		minPrice: '',
		maxPrice: '',
		minSqm: '',
		maxSqm: '',
		rooms: 'all',
		bathrooms: 'all'
	});

	// Automatski kreiramo state za dinamičke filtere iz rječnika
	let dynamicFilters = $state(
		Object.keys(dodatneSpecifikacije).reduce(
			(acc, key) => {
				acc[key] = 'all';
				return acc;
			},
			{} as Record<string, string>
		)
	);

	// --- STATE ZA PAGINACIJU ---
	let currentPage = $state(1);
	const itemsPerPage = 5;

	// --- IZVEDENE VRIJEDNOSTI (DERIVED) ---
	// Ovdje filtriramo i odmah sortiramo podatke
	let filteredAndSortedListings = $derived(() => {
		// 1. Filtriranje
		let result = listings.filter((p) => {
			// Osnovni filteri
			if (filters.status !== 'all' && p.status !== filters.status) return false;
			if (filters.type !== 'all' && p.type !== filters.type) return false;

			// Brojčani rasponi
			if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
			if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
			if (filters.minSqm && p.sqm < Number(filters.minSqm)) return false;
			if (filters.maxSqm && p.sqm > Number(filters.maxSqm)) return false;
			if (filters.rooms !== 'all' && p.rooms !== Number(filters.rooms)) return false;
			if (filters.bathrooms !== 'all' && p.bathrooms !== Number(filters.bathrooms)) return false;

			for (const kljuc in dynamicFilters) {
				if (dynamicFilters[kljuc] !== 'all' && p.attributes?.[kljuc] !== dynamicFilters[kljuc]) {
					return false;
				}
			}
			return true;
		});

		// 2. Sortiranje
		result.sort((a, b) => {
			if (sortBy === 'price_asc') return a.price - b.price;
			if (sortBy === 'price_desc') return b.price - a.price;
			if (sortBy === 'newest')
				return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
			if (sortBy === 'oldest')
				return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
			return 0;
		});

		return result;
	});

	// Izvršavanje derivacije
	let processedListings = $derived(filteredAndSortedListings());

	// Resetiraj stranicu na 1 kad god se filteri ili sortiranje promijene
	$effect(() => {
		filters;
		dynamicFilters;
		sortBy;
		currentPage = 1;
	});

	let totalPages = $derived(Math.ceil(processedListings.length / itemsPerPage));
	let paginatedListings = $derived(
		processedListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);
	};
</script>

<div class="mx-auto max-w-7xl px-4 py-8 md:px-8">
	<!-- Mobile Filter Toggle -->
	<div class="mb-6 flex items-center justify-between md:hidden">
		<h1 class="text-2xl font-bold text-gray-900">Pretraga</h1>
		<button
			class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm"
			onclick={() => (mobileFiltersOpen = !mobileFiltersOpen)}
		>
			<span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 transition-transform group-hover:translate-x-1"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						d="M3 4.6C3 4.03995 3 3.75992 3.10899 3.54601C3.20487 3.35785 3.35785 3.20487 3.54601 3.10899C3.75992 3 4.03995 3 4.6 3H19.4C19.9601 3 20.2401 3 20.454 3.10899C20.6422 3.20487 20.7951 3.35785 20.891 3.54601C21 3.75992 21 4.03995 21 4.6V6.33726C21 6.58185 21 6.70414 20.9724 6.81923C20.9479 6.92127 20.9075 7.01881 20.8526 7.10828C20.7908 7.2092 20.7043 7.29568 20.5314 7.46863L14.4686 13.5314C14.2957 13.7043 14.2092 13.7908 14.1474 13.8917C14.0925 13.9812 14.0521 14.0787 14.0276 14.1808C14 14.2959 14 14.4182 14 14.6627V17L10 21V14.6627C10 14.4182 10 14.2959 9.97237 14.1808C9.94787 14.0787 9.90747 13.9812 9.85264 13.8917C9.7908 13.7908 9.70432 13.7043 9.53137 13.5314L3.46863 7.46863C3.29568 7.29568 3.2092 7.2092 3.14736 7.10828C3.09253 7.01881 3.05213 6.92127 3.02763 6.81923C3 6.70414 3 6.58185 3 6.33726V4.6Z"
						stroke="#000000"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg></span
			>
			Filteri
		</button>
	</div>

	<div class="flex flex-col gap-8 md:flex-row md:items-start">
		<!-- SIDEBAR S FILTERIMA -->
		<aside
			class="
            fixed inset-0 z-50 h-full w-full overflow-y-auto bg-white p-6 transition-transform duration-300 md:sticky md:top-24 md:z-0 md:block md:w-80 md:shrink-0 md:rounded-2xl md:border md:border-gray-200 md:p-6 md:shadow-sm
            {mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        "
		>
			<div class="mb-6 flex items-center justify-between md:mb-8">
				<h2 class="text-xl font-bold text-gray-900">Filteri</h2>
				<button class="text-gray-500 md:hidden" onclick={() => (mobileFiltersOpen = false)}>
					<!-- SVG Close Icon --> X
				</button>
			</div>

			<div class="space-y-6">
				<!-- Osnovni filteri -->
				<div class="space-y-4">
					<div>
						<label class="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
						<select
							bind:value={filters.status}
							class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
						>
							<option value="all">Sve</option>
							<option value="sale">Prodaja</option>
							<option value="rent">Najam</option>
						</select>
					</div>

					<div>
						<label class="mb-1.5 block text-sm font-medium text-gray-700">Vrsta nekretnine</label>
						<select
							bind:value={filters.type}
							class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
						>
							<option value="all">Sve vrste</option>
							{#each data.propertyTypes as typeName}
								<option value={typeName}>{typeName}</option>
							{/each}
						</select>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-gray-700">Cijena od (€)</label>
							<input
								type="number"
								bind:value={filters.minPrice}
								placeholder="Min"
								class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
							/>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-gray-700">Cijena do (€)</label>
							<input
								type="number"
								bind:value={filters.maxPrice}
								placeholder="Max"
								class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="mb-1.5 block text-sm font-medium text-gray-700">Kvadrati od</label>
							<input
								type="number"
								bind:value={filters.minSqm}
								placeholder="Min"
								class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
							/>
						</div>
						<div>
							<label class="mb-1.5 block text-sm font-medium text-gray-700">Kvadrati do</label>
							<input
								type="number"
								bind:value={filters.maxSqm}
								placeholder="Max"
								class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
							/>
						</div>
					</div>
				</div>

				<hr class="border-gray-200" />

				<!-- Dinamički filteri -->
				<div>
					<h3 class="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
						Karakteristike
					</h3>
					<div class="space-y-4">
						<!-- Osnovne fiksne karakteristike (sobe/kupatila) -->
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="mb-1.5 block text-xs font-medium text-gray-700">Sobe</label>
								<select
									bind:value={filters.rooms}
									class="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none"
								>
									<option value="all">Sve</option>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4+</option>
								</select>
							</div>
							<div>
								<label class="mb-1.5 block text-xs font-medium text-gray-700">Kupaonice</label>
								<select
									bind:value={filters.bathrooms}
									class="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none"
								>
									<option value="all">Sve</option>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3+</option>
								</select>
							</div>
						</div>

						<!-- Ovdje se generiraju dropdownovi iz 'dodatneSpecifikacije' rječnika -->
						{#each Object.entries(dodatneSpecifikacije) as [kategorija, opcije]}
							<div>
								<label class="mb-1.5 block text-xs font-medium text-gray-700"
									>{filterLabels[kategorija] ?? kategorija}</label
								>
								<select
									bind:value={dynamicFilters[kategorija]}
									class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none"
								>
									<option value="all">Sve</option>
									{#each opcije as opcija}
										<option value={opcija}>{opcija}</option>
									{/each}
								</select>
							</div>
						{/each}
					</div>
				</div>

				<button
					class="mt-6 w-full rounded-lg bg-yellow-500 py-3 font-bold text-white md:hidden"
					onclick={() => (mobileFiltersOpen = false)}
				>
					Prikaži rezultate ({processedListings.length})
				</button>
			</div>
		</aside>

		<!-- LISTA OGLASA -->
		<main class="flex-1">
			<div
				class="mb-6 flex flex-col items-start justify-between gap-4 text-sm text-gray-600 sm:flex-row sm:items-center"
			>
				<span>Pronađeno <strong>{processedListings.length}</strong> oglasa</span>

				<!-- DROPDOWN ZA SORTIRANJE -->
				<div class="flex items-center gap-2">
					<label for="sort" class="font-medium">Sortiraj:</label>
					<select
						id="sort"
						bind:value={sortBy}
						class="rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 outline-none hover:border-gray-400"
					>
						<option value="newest">Najnovije prvo</option>
						<option value="oldest">Najstarije prvo</option>
						<option value="price_asc">Cijena: od najniže</option>
						<option value="price_desc">Cijena: od najviše</option>
					</select>
				</div>
			</div>

			<div class="flex flex-col gap-5">
				{#each paginatedListings as property (property.id)}
					<a
						href="/nekretnina/{property.id}"
						class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row"
					>
						<!-- Slika -->
						<div class="relative h-60 w-full shrink-0 sm:h-auto sm:w-72">
							<img src={property.image} alt={property.title} class="h-full w-full object-cover" />
							<div
								class="absolute top-3 left-3 rounded bg-yellow-500/90 px-2.5 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm"
							>
								{property.status === 'rent' ? 'Najam' : 'Prodaja'}
							</div>
						</div>

						<!-- Info -->
						<div class="flex flex-1 flex-col p-5">
							<div class="flex flex-col gap-4 md:flex-row md:justify-between">
								<div class="flex-1">
									<h2
										class="line-clamp-2 text-xl font-bold text-yellow-950 transition-colors hover:text-yellow-700"
									>
										{property.title}
									</h2>
									<p class="mt-1 flex items-center text-sm text-gray-500">
										<span class="mr-1.5 text-gray-400"
											><svg
												xmlns="http://www.w3.org/2000/svg"
												class="mr-1.5 h-4 w-4 shrink-0 text-gray-400"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
												/>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
												/>
											</svg></span
										>
										{property.address}
									</p>
								</div>
								<div class="shrink-0 text-left md:text-right">
									<div class="text-2xl font-extrabold text-yellow-500">
										{formatPrice(property.price)}
									</div>
									<div class="mt-0.5 text-sm font-medium text-gray-500">
										{Math.round(property.price / property.sqm)} €/m²
									</div>
								</div>
							</div>

							<div class="flex-grow"></div>

							<div
								class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-100 pt-4 text-sm font-medium text-gray-700"
							>
								<div class="flex items-center gap-2">
									<span class="text-gray-400"><!-- SVG Vrsta --> 🏢</span>
									{property.type}
								</div>
								<div class="flex items-center gap-2">
									<span class="text-gray-400"
										><svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5 text-gray-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
											/>
										</svg></span
									>
									{property.sqm} m²
								</div>
								<div class="flex items-center gap-2">
									<span class="text-gray-400">🚪</span>
									{property.rooms ?? '—'}
								</div>
								<div class="flex items-center gap-2 text-gray-500">
									<span class="text-gray-400">📅</span>
									{new Date(property.dateAdded).toLocaleDateString('hr-HR')}
								</div>
							</div>
						</div>
					</a>
				{/each}

				{#if processedListings.length === 0}
					<div class="py-12 text-center text-gray-500">
						Nema rezultata za odabrane filtere. Pokušajte proširiti pretragu.
					</div>
				{/if}
			</div>

			<!-- PAGINACIJA -->
			{#if totalPages > 1}
				<div class="mt-10 flex items-center justify-center gap-2">
					<button
						class="flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
						disabled={currentPage === 1}
						onclick={() => (currentPage -= 1)}
					>
						Prethodna
					</button>

					{#each Array(totalPages) as _, i}
						<button
							class="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors
                                {currentPage === i + 1
								? 'bg-yellow-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'}"
							onclick={() => (currentPage = i + 1)}
						>
							{i + 1}
						</button>
					{/each}

					<button
						class="flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage += 1)}
					>
						Sljedeća
					</button>
				</div>
			{/if}
		</main>
	</div>
</div>
