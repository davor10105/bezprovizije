<script lang="ts">
	import rijekaFirst from '$lib/assets/rijeka3-1.jpg';
	import MapPreview from '$lib/MapPreview.svelte';
	import type { ListingCard } from '$lib/properties/queries';
	import type { LocationHierarchy } from '$lib/properties/location';
	import type { ListingType, PropertyType } from '$lib/types/property';

	let {
		listings = [],
		locationHierarchy = {},
		propertyTypes = []
	}: {
		listings?: Pick<ListingCard, 'lat' | 'lng' | 'price' | 'type'>[];
		locationHierarchy?: LocationHierarchy;
		propertyTypes?: { value: string; label: string }[];
	} = $props();

	let listingType = $state<ListingType>('sale');
	let propertyType = $state<PropertyType | ''>('');
	let selectedCounty = $state('');
	let selectedCity = $state('');

	const counties = $derived(Object.keys(locationHierarchy));
	const cities = $derived(
		selectedCounty ? Object.keys(locationHierarchy[selectedCounty] ?? {}) : []
	);
	const availableNeighborhoods = $derived(
		selectedCounty && selectedCity ? (locationHierarchy[selectedCounty]?.[selectedCity] ?? []) : []
	);

	function onCountyChange() {
		selectedCity = '';
	}
</script>

<section
	class="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden bg-gray-100"
>
	<div
		style="background-image: url({rijekaFirst});"
		class="absolute inset-0 scale-105 bg-cover bg-center blur-xs"
	></div>

	<div class="relative z-10 p-4 text-center">
		<div
			class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 py-12 md:flex-row md:gap-8 md:px-4"
		>
			<div class="flex-1 rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur md:p-8">
				<h1 class="mb-6 text-2xl font-bold text-gray-800 md:text-3xl">Pronađite svoj novi dom</h1>

				<form method="GET" action="/pretraga" class="space-y-5 text-left">
					<div class="flex rounded-lg bg-gray-200 p-1">
						<button
							type="button"
							class="flex-1 rounded-md py-2 text-sm font-semibold transition-all {listingType ===
							'sale'
								? 'bg-white text-gray-900 shadow'
								: 'text-gray-600 hover:text-gray-900'}"
							onclick={() => (listingType = 'sale')}
						>
							Prodaja
						</button>
						<button
							type="button"
							class="flex-1 rounded-md py-2 text-sm font-semibold transition-all {listingType ===
							'rent'
								? 'bg-white text-gray-900 shadow'
								: 'text-gray-600 hover:text-gray-900'}"
							onclick={() => (listingType = 'rent')}
						>
							Najam
						</button>
					</div>
					<input type="hidden" name="listing" value={listingType} />

					<div>
						<label for="type" class="mb-1 block text-sm font-medium text-gray-700"
							>Vrsta nekretnine</label
						>
						<select
							id="type"
							name="type"
							bind:value={propertyType}
							class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-yellow-500 focus:ring-yellow-500"
						>
							<option value="">Sve vrste</option>
							{#each propertyTypes as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Cijena (€)</label>
						<div class="flex gap-3">
							<input
								type="number"
								name="minPrice"
								min="0"
								placeholder="Min cijena"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-yellow-500 focus:ring-yellow-500"
							/>
							<input
								type="number"
								name="maxPrice"
								min="0"
								placeholder="Max cijena"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-yellow-500 focus:ring-yellow-500"
							/>
						</div>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Površina (m²)</label>
						<div class="flex gap-3">
							<input
								type="number"
								name="minSqm"
								min="0"
								placeholder="Min m²"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-yellow-500 focus:ring-yellow-500"
							/>
							<input
								type="number"
								name="maxSqm"
								min="0"
								placeholder="Max m²"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-yellow-500 focus:ring-yellow-500"
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
								<label for="city" class="mb-1.5 block text-xs font-medium text-gray-700">Grad</label
								>
								<select
									id="city"
									name="city"
									bind:value={selectedCity}
									disabled={!selectedCounty}
									class="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-yellow-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
								>
									<option value=""
										>{selectedCounty ? 'Svi gradovi' : 'Prvo odaberite županiju'}</option
									>
									{#each cities as city}
										<option value={city}>{city}</option>
									{/each}
								</select>
							</div>

							{#if selectedCity && availableNeighborhoods.length > 0}
								<fieldset>
									<legend class="mb-2 block text-xs font-medium text-gray-700">Kvartovi</legend>
									<div
										class="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3"
									>
										{#each availableNeighborhoods as neighborhood}
											<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
												<input
													type="checkbox"
													name="neighborhood"
													value={neighborhood}
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
						type="submit"
						class="w-full rounded-xl bg-linear-to-br from-yellow-500 to-yellow-600 py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-yellow-600"
					>
						Pretraži nekretnine
					</button>
				</form>
			</div>

			<div
				class="flex flex-1 flex-col items-center justify-between rounded-2xl bg-white/95 p-6 text-center shadow-xl backdrop-blur md:p-8"
			>
				<h2 class="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
					Prodajte ili iznajmite bez provizije
				</h2>
				<p class="mb-8 text-lg text-gray-600">
					Objavite oglas u nekoliko minuta i stupite u kontakt s kupcima i najmoprimcima.
				</p>

				<div
					class="mb-8 flex aspect-auto w-full items-center justify-center overflow-hidden rounded-xl bg-gray-200"
				>
					<MapPreview {listings} />
				</div>

				<a
					href="/objavi-oglas"
					class="block w-full rounded-xl bg-linear-to-br from-yellow-500 to-yellow-600 py-4 text-lg font-bold text-white shadow-md transition-colors hover:bg-yellow-600"
				>
					Objavite oglas
				</a>
			</div>
		</div>
	</div>
</section>
