<script lang="ts">
	import {
		countActiveExtraFilters,
		formDataToSearchParams,
		searchHref
	} from '$lib/properties/search';
	import AttributeFieldGroups from '$lib/properties/AttributeFieldGroups.svelte';
	import { CORE_OPTIONAL_FIELDS, getSearchableAttributeFieldsGrouped, isPropertyTypeAllowedForListing } from '$lib/properties/schema';

	let { data } = $props();

	let mobileFiltersOpen = $state(false);
	let extraFiltersOpen = $state(countActiveExtraFilters(data.filters) > 0);
	let selectedCounty = $state(data.filters.county);
	let selectedCity = $state(data.filters.city);
	let selectedListingType = $state(data.filters.listingType);
	let selectedPropertyType = $state(data.filters.propertyType);

	const extraFilterCount = $derived(countActiveExtraFilters(data.filters));

	// Additional filters follow the shared schema and update live as the user
	// changes the property type and/or sale-vs-rent selection.
	const attributeFieldGroups = $derived(
		getSearchableAttributeFieldsGrouped(selectedPropertyType, selectedListingType)
	);
	const coreFilters = $derived(
		selectedPropertyType
			? CORE_OPTIONAL_FIELDS[selectedPropertyType]
			: { rooms: true, bathrooms: true, build_year: true, parking_spaces: true }
	);

	const availablePropertyTypes = $derived(
		data.propertyTypes.filter((propertyType) =>
			isPropertyTypeAllowedForListing(propertyType.value as PropertyType, selectedListingType)
		)
	);

	$effect(() => {
		if (
			selectedPropertyType === 'room' &&
			selectedListingType === 'sale'
		) {
			selectedPropertyType = '';
		}
	});

	const counties = $derived(Object.keys(data.locationHierarchy));
	const cities = $derived(
		selectedCounty ? Object.keys(data.locationHierarchy[selectedCounty] ?? {}) : []
	);
	const availableNeighborhoods = $derived(
		selectedCounty && selectedCity
			? (data.locationHierarchy[selectedCounty]?.[selectedCity] ?? [])
			: []
	);

	const formatPrice = (price: number) =>
		new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);

	function submitSearchForm(form: HTMLFormElement) {
		const params = formDataToSearchParams(new FormData(form));
		const query = params.toString();
		window.location.href = query ? `/pretraga?${query}` : '/pretraga';
	}

	function onSearchSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitSearchForm(event.currentTarget as HTMLFormElement);
	}

	function onSortChange(event: Event) {
		const form = (event.currentTarget as HTMLSelectElement).form;
		if (form) submitSearchForm(form);
	}

	function onCountyChange() {
		selectedCity = '';
	}

	function toggleExtraFilters() {
		extraFiltersOpen = !extraFiltersOpen;
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 md:px-8">
	<div class="mb-6 flex items-center justify-between md:hidden">
		<h1 class="text-2xl font-bold text-gray-900">Pretraga</h1>
		<button
			type="button"
			class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm"
			onclick={() => (mobileFiltersOpen = !mobileFiltersOpen)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					d="M3 4.6C3 4.03995 3 3.75992 3.10899 3.54601C3.20487 3.35785 3.35785 3.20487 3.54601 3.10899C3.75992 3 4.03995 3 4.6 3H19.4C19.9601 3 20.2401 3 20.454 3.10899C20.6422 3.20487 20.7951 3.35785 20.891 3.54601C21 3.75992 21 4.03995 21 4.6V6.33726C21 6.58185 21 6.70414 20.9724 6.81923C20.9479 6.92127 20.9075 7.01881 20.8526 7.10828C20.7908 7.2092 20.7043 7.29568 20.5314 7.46863L14.4686 13.5314C14.2957 13.7043 14.2092 13.7908 14.1474 13.8917C14.0925 13.9812 14.0521 14.0787 14.0276 14.1808C14 14.2959 14 14.4182 14 14.6627V17L10 21V14.6627C10 14.4182 10 14.2959 9.97237 14.1808C9.94787 14.0787 9.90747 13.9812 9.85264 13.8917C9.7908 13.7908 9.70432 13.7043 9.53137 13.5314L3.46863 7.46863C3.29568 7.29568 3.2092 7.2092 3.14736 7.10828C3.09253 7.01881 3.05213 6.92127 3.02763 6.81923C3 6.70414 3 6.58185 3 6.33726V4.6Z"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Filteri
		</button>
	</div>

	<form
		id="search-form"
		method="GET"
		action="/pretraga"
		class="flex flex-col gap-8 md:flex-row md:items-start"
		onsubmit={onSearchSubmit}
	>
		<aside
			class="fixed inset-0 z-40 h-full w-full overflow-y-auto bg-white p-6 transition-transform duration-300 md:sticky md:top-24 md:z-0 md:block md:w-80 md:shrink-0 md:rounded-2xl md:border md:border-gray-200 md:p-6 md:shadow-sm
            {mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"
		>
			<div
				class="sticky top-0 z-10 -mx-6 -mt-6 mb-6 flex items-center justify-between border-b border-gray-100 bg-white px-6 pt-6 pb-4 md:static md:mx-0 md:mt-0 md:mb-8 md:border-0 md:p-0"
			>
				<h2 class="text-xl font-bold text-gray-900">Filteri</h2>
				<button
					type="button"
					class="rounded-lg p-1 text-2xl leading-none text-gray-500 hover:bg-gray-100 md:hidden"
					onclick={() => (mobileFiltersOpen = false)}
					aria-label="Zatvori filtere"
				>
					✕
				</button>
			</div>

			<div class="space-y-5">
				<div>
					<label for="listing" class="mb-1.5 block text-sm font-medium text-gray-700">Ponuda</label>
					<select
						id="listing"
						name="listing"
						bind:value={selectedListingType}
						class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
					>
						<option value="">Prodaja i najam</option>
						<option value="sale">Prodaja</option>
						<option value="rent">Najam</option>
					</select>
				</div>

				<div>
					<label for="type" class="mb-1.5 block text-sm font-medium text-gray-700"
						>Vrsta nekretnine</label
					>
					<select
						id="type"
						name="type"
						bind:value={selectedPropertyType}
						class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
					>
						<option value="">Sve vrste</option>
						{#each availablePropertyTypes as propertyType}
							<option value={propertyType.value}>{propertyType.label}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="minPrice" class="mb-1.5 block text-sm font-medium text-gray-700"
							>Cijena od (€)</label
						>
						<input
							id="minPrice"
							name="minPrice"
							type="number"
							min="0"
							value={data.filters.minPrice ?? ''}
							placeholder="Min"
							class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
						/>
					</div>
					<div>
						<label for="maxPrice" class="mb-1.5 block text-sm font-medium text-gray-700"
							>Cijena do (€)</label
						>
						<input
							id="maxPrice"
							name="maxPrice"
							type="number"
							min="0"
							value={data.filters.maxPrice ?? ''}
							placeholder="Max"
							class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="minSqm" class="mb-1.5 block text-sm font-medium text-gray-700"
							>Površina od (m²)</label
						>
						<input
							id="minSqm"
							name="minSqm"
							type="number"
							min="0"
							value={data.filters.minSqm ?? ''}
							placeholder="Min"
							class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
						/>
					</div>
					<div>
						<label for="maxSqm" class="mb-1.5 block text-sm font-medium text-gray-700"
							>Površina do (m²)</label
						>
						<input
							id="maxSqm"
							name="maxSqm"
							type="number"
							min="0"
							value={data.filters.maxSqm ?? ''}
							placeholder="Max"
							class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
						/>
					</div>
				</div>

				<div class="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
					<p class="text-sm font-semibold text-gray-800">Lokacija</p>

					{#if counties.length === 0}
						<p class="text-xs text-gray-500">
							Lokacijski filteri bit će dostupni kad odobreni oglasi imaju spremljenu lokaciju.
						</p>
					{:else}
						<div>
							<label for="county" class="mb-1.5 block text-xs font-medium text-gray-700"
								>Županija</label
							>
							<select
								id="county"
								name="county"
								bind:value={selectedCounty}
								onchange={onCountyChange}
								class="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-yellow-500"
							>
								<option value="">Sve županije</option>
								{#each counties as county}
									<option value={county}>{county}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="city" class="mb-1.5 block text-xs font-medium text-gray-700">Grad</label>
							<select
								id="city"
								name="city"
								bind:value={selectedCity}
								disabled={!selectedCounty}
								class="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
							>
								<option value="">{selectedCounty ? 'Svi gradovi' : 'Prvo odaberite županiju'}</option
								>
								{#each cities as city}
									<option value={city}>{city}</option>
								{/each}
							</select>
						</div>

						{#if selectedCity && availableNeighborhoods.length > 0}
							<fieldset>
								<legend class="mb-2 block text-xs font-medium text-gray-700">Kvartovi</legend>
								<div class="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
									{#each availableNeighborhoods as neighborhood}
										<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
											<input
												type="checkbox"
												name="neighborhood"
												value={neighborhood}
												checked={data.filters.neighborhoods.includes(neighborhood)}
												class="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
											/>
											{neighborhood}
										</label>
									{/each}
								</div>
								<p class="mt-1 text-xs text-gray-500">Možete odabrati više kvartova odjednom</p>
							</fieldset>
						{:else if selectedCity}
							<p class="text-xs text-gray-500">Nema dostupnih kvartova za odabrani grad.</p>
						{/if}
					{/if}
				</div>

				<button
					type="button"
					class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-yellow-400 hover:bg-yellow-50"
					onclick={toggleExtraFilters}
					aria-expanded={extraFiltersOpen}
				>
					<span>Dodatni filteri</span>
					<span class="flex items-center gap-2">
						{#if extraFilterCount > 0}
							<span class="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white">
								{extraFilterCount}
							</span>
						{/if}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4 text-gray-500 transition-transform duration-200 {extraFiltersOpen
								? 'rotate-180'
								: ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</span>
				</button>

				<div
					class="grid transition-[grid-template-rows] duration-300 ease-out"
					style:grid-template-rows={extraFiltersOpen ? '1fr' : '0fr'}
				>
					<div class="overflow-hidden">
						<div class="space-y-5 border-t border-gray-200 pt-5">
							{#if coreFilters.rooms || coreFilters.bathrooms}
								<div class="grid grid-cols-2 gap-2">
									{#if coreFilters.rooms}
										<div>
											<label for="rooms" class="mb-1.5 block text-xs font-medium text-gray-700"
												>Sobe</label
											>
											<select
												id="rooms"
												name="rooms"
												value={data.filters.rooms || ''}
												class="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-yellow-500"
											>
												<option value="">Sve</option>
												<option value="1">1</option>
												<option value="2">2</option>
												<option value="3">3</option>
												<option value="4+">4+</option>
											</select>
										</div>
									{/if}
									{#if coreFilters.bathrooms}
										<div>
											<label for="bathrooms" class="mb-1.5 block text-xs font-medium text-gray-700"
												>Kupaonice</label
											>
											<select
												id="bathrooms"
												name="bathrooms"
												value={data.filters.bathrooms || ''}
												class="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-yellow-500"
											>
												<option value="">Sve</option>
												<option value="1">1</option>
												<option value="2">2</option>
												<option value="3+">3+</option>
											</select>
										</div>
									{/if}
								</div>
							{/if}

							{#if coreFilters.build_year || coreFilters.parking_spaces}
								<div class="grid grid-cols-2 gap-2">
									{#if coreFilters.build_year}
										<div>
											<label for="minBuildYear" class="mb-1.5 block text-xs font-medium text-gray-700"
												>Godina gradnje od</label
											>
											<input
												id="minBuildYear"
												name="minBuildYear"
												type="number"
												min="1800"
												max="2100"
												value={data.filters.minBuildYear ?? ''}
												placeholder="npr. 2000"
												class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
											/>
										</div>
									{/if}
									{#if coreFilters.parking_spaces}
										<div>
											<label for="minParking" class="mb-1.5 block text-xs font-medium text-gray-700"
												>Parkirna mjesta (min.)</label
											>
											<input
												id="minParking"
												name="minParking"
												type="number"
												min="0"
												value={data.filters.minParking ?? ''}
												placeholder="npr. 1"
												class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
											/>
										</div>
									{/if}
								</div>
							{/if}

							{#if selectedPropertyType}
								<AttributeFieldGroups
									mode="search"
									groups={attributeFieldGroups}
									filterAttributes={data.filters.attributes}
								/>
							{:else}
								<p class="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
									Odaberite vrstu nekretnine iznad kako biste vidjeli dodatne filtere po
									kategorijama.
								</p>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex gap-2 pt-1">
					<button
						type="submit"
						class="flex-1 rounded-lg bg-yellow-500 py-3 font-bold text-white hover:bg-yellow-600"
					>
						Pretraži
					</button>
					<a
						href="/pretraga"
						onclick={() => (mobileFiltersOpen = false)}
						class="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
					>
						Poništi
					</a>
				</div>

				<button
					type="button"
					class="mt-3 w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:hidden"
					onclick={() => (mobileFiltersOpen = false)}
				>
					Zatvori filtere
				</button>
			</div>
		</aside>

		<main class="flex-1">
			<div
				class="mb-6 flex flex-col items-start justify-between gap-4 text-sm text-gray-600 sm:flex-row sm:items-center"
			>
				<span
					>Pronađeno <strong>{data.total}</strong>
					{data.total === 1 ? 'oglas' : 'oglasa'}</span
				>

				<div class="flex items-center gap-2">
					<label for="sort" class="font-medium">Sortiraj:</label>
					<select
						id="sort"
						name="sort"
						form="search-form"
						value={data.filters.sort}
						onchange={onSortChange}
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
				{#each data.listings as property (property.id)}
					<a
						href="/nekretnina/{property.id}"
						class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row"
					>
						<div class="relative h-60 w-full shrink-0 sm:h-auto sm:w-72">
							<img src={property.image} alt={property.title} class="h-full w-full object-cover" />
							<div
								class="absolute top-3 left-3 rounded bg-yellow-500/90 px-2.5 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm"
							>
								{property.status === 'rent' ? 'Najam' : 'Prodaja'}
							</div>
						</div>

						<div class="flex flex-1 flex-col p-5">
							<div class="flex flex-col gap-4 md:flex-row md:justify-between">
								<div class="flex-1">
									<h2
										class="line-clamp-2 text-xl font-bold text-yellow-950 transition-colors group-hover:text-yellow-700"
									>
										{property.title}
									</h2>
									<p class="mt-1 flex items-center text-sm text-gray-500">
										<svg
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
										</svg>
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
									<span class="text-gray-400">🏢</span>
									{property.type}
								</div>
								<div class="flex items-center gap-2">
									<svg
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
									</svg>
									{property.sqm} m²
								</div>
								{#if property.rooms != null}
									<div class="flex items-center gap-2">
										<span class="text-gray-400">🚪</span>
										{property.rooms} soba
									</div>
								{/if}
								<div class="flex items-center gap-2 text-gray-500">
									<span class="text-gray-400">📅</span>
									{new Date(property.dateAdded).toLocaleDateString('hr-HR')}
								</div>
							</div>
						</div>
					</a>
				{/each}

				{#if data.listings.length === 0}
					<div class="py-12 text-center text-gray-500">
						Nema rezultata za odabrane filtere. Pokušajte proširiti pretragu.
					</div>
				{/if}
			</div>

			{#if data.totalPages > 1}
				{@const pageFilters = { ...data.filters, page: data.filters.page }}
				<nav class="mt-10 flex items-center justify-center gap-4" aria-label="Stranice">
					{#if data.filters.page > 1}
						<a
							href={searchHref(pageFilters, { page: data.filters.page - 1 })}
							class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
						>
							Prethodna
						</a>
					{:else}
						<span
							class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 opacity-50"
						>
							Prethodna
						</span>
					{/if}

					<span class="text-sm text-gray-600">
						Stranica {data.filters.page} od {data.totalPages}
					</span>

					{#if data.filters.page < data.totalPages}
						<a
							href={searchHref(pageFilters, { page: data.filters.page + 1 })}
							class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
						>
							Sljedeća
						</a>
					{:else}
						<span
							class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 opacity-50"
						>
							Sljedeća
						</span>
					{/if}
				</nav>
			{/if}
		</main>
	</form>
</div>
