<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();

	const properties = data.listings;

	// -- Leaflet instances --
	let mapElement;
	let map;
	let markersGroup;
	let L;
	let streetLayer;
	let satelliteLayer;

	// -- Svelte 5 Reactive State --
	// -- Svelte 5 Reactive State --
	let isMapReady = $state(false);
	let isFilterOpen = $state(false);
	let mapStyle = $state('street');
	let selectedProperty = $state(null); // <-- Dodaj ovo nazad

	// Zadani status je sada isključivo 'sale' (Prodaja) ili 'rent' (Najam)
	let filterStatus = $state('sale');
	let minPrice = $state<number | null>(null);
	let maxPrice = $state<number | null>(null);
	let minSqm = $state<number | null>(null);
	let maxSqm = $state<number | null>(null);

	function onFilterNumberInput(
		setter: (value: number | null) => void,
		event: Event & { currentTarget: HTMLInputElement }
	) {
		const raw = event.currentTarget.value.trim();
		if (!raw) {
			setter(null);
			return;
		}
		const value = Number(raw);
		setter(Number.isFinite(value) && value >= 0 ? value : null);
	}

	// Checkbox state za tipove nekretnina
	let typeFilters = $state(
		Object.fromEntries(data.propertyTypes.map((type) => [type, true])) as Record<string, boolean>
	);

	let filteredProperties = $derived(
		properties.filter((p) => {
			const matchesStatus = p.status === filterStatus; // Striktno podudaranje
			const matchesPrice =
				(minPrice == null || p.price >= minPrice) && (maxPrice == null || p.price <= maxPrice);
			const matchesSqm =
				(minSqm == null || p.sqm >= minSqm) && (maxSqm == null || p.sqm <= maxSqm);
			const matchesType = typeFilters[p.type] ?? true;
			return matchesStatus && matchesPrice && matchesSqm && matchesType;
		})
	);

	function formatMarkerPrice(price) {
		const compact = (value: number, suffix: string) => {
			const rounded = Math.round(value * 10) / 10;
			return rounded.toLocaleString('hr-HR', { maximumFractionDigits: 1 }) + suffix;
		};
		if (price >= 1_000_000) {
			return compact(price / 1_000_000, 'M €');
		}
		if (price >= 1000) {
			return compact(price / 1000, 'k €');
		}
		return price + ' €';
	}

	function formatFullPrice(price) {
		return new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);
	}

	const typeColorMap: Record<string, string> = {
		Kuća: 'bg-emerald-600',
		Stan: 'bg-blue-600',
		Garaža: 'bg-gray-700',
		Poslovni: 'bg-purple-600',
		Soba: 'bg-indigo-600'
	};

	function toggleMapStyle() {
		mapStyle = mapStyle === 'street' ? 'satellite' : 'street';
		if (mapStyle === 'satellite') {
			map.removeLayer(streetLayer);
			satelliteLayer.addTo(map);
		} else {
			map.removeLayer(satelliteLayer);
			streetLayer.addTo(map);
		}
	}

	onMount(async () => {
		const leaflet = await import('leaflet');
		L = leaflet.default || leaflet;
		window.L = L;
		await import('leaflet.markercluster');

		map = L.map(mapElement, { zoomControl: false }).setView([44.4, 16.3], 7);
		L.control.zoom({ position: 'topright' }).addTo(map);

		streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		});

		satelliteLayer = L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{ attribution: 'Tiles &copy; Esri' }
		);

		streetLayer.addTo(map);

		markersGroup = L.markerClusterGroup({
			showCoverageOnHover: false,
			maxClusterRadius: 50,
			zoomToBoundsOnClick: false,
			iconCreateFunction: function (cluster) {
				return L.divIcon({
					html: `<div class="pointer-events-auto cursor-pointer flex items-center justify-center w-10 h-10 bg-yellow-500 text-black rounded-full font-bold shadow-lg hover:scale-110 transition-transform duration-200">${cluster.getChildCount()}</div>`,
					className: '!bg-transparent !border-none',
					iconSize: L.point(40, 40)
				});
			}
		});

		markersGroup.on('clusterclick', function (a) {
			a.layer.zoomToBounds({ padding: [30, 30] });
		});

		map.addLayer(markersGroup);
		isMapReady = true;
	});

	$effect(() => {
		if (!isMapReady) return;

		markersGroup.clearLayers();

		filteredProperties.forEach((property) => {
			const baseColor = typeColorMap[property.type] || 'bg-gray-900';
			const priceLabel = formatMarkerPrice(property.price);

			// Marker (bez točkice)
			const priceIcon = L.divIcon({
				className: '!bg-transparent !border-none',
				html: `<div class="group pointer-events-auto flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110">
                            <!-- Glavni oblačić -->
                            <div class="whitespace-nowrap relative z-10 flex items-center justify-center rounded-full px-3 py-1 text-sm font-bold text-white shadow-md transition-colors duration-200 ${baseColor} group-hover:bg-black group-hover:text-yellow-500">
                                ${priceLabel}
                            </div>
                            <!-- Špic koji pokazuje na točnu lokaciju -->
                            <div class="relative z-0 -mt-1.5 h-3 w-3 rotate-45 shadow-sm transition-colors duration-200 ${baseColor} group-hover:bg-black"></div>
                       </div>`,
				iconSize: [75, 40],
				iconAnchor: [37.5, 36], // Sidro je pomaknuto na dno novog špica
				popupAnchor: [0, -36] // Oblačić (popup) se sada otvara iznad špica
			});

			// HTML struktura za oblačić (Popup)
			const popupHtml = `
                <div class="w-64 font-sans text-left">
                    <div class="relative h-40 w-full mb-3 rounded-lg overflow-hidden shrink-0">
                        <img src="${property.image}" alt="${property.title}" class="h-full w-full object-cover" />
                        <span class="absolute bottom-2 right-2 rounded-full ${baseColor} px-2 py-1 text-[10px] font-bold text-white shadow-sm uppercase tracking-wide">
                            ${property.type}
                        </span>
                    </div>
                    <h3 class="m-0 mb-1 line-clamp-1 text-base font-bold text-gray-900">${property.title}</h3>
                    <p class="m-0 mb-3 text-xl font-extrabold text-yellow-600">
                        ${formatFullPrice(property.price)} 
                        <span class="text-xs font-medium text-gray-500">${property.status === 'rent' ? '/ mj.' : ''}</span>
                    </p>
                    <div class="mb-4 text-sm font-medium text-gray-500 border-t border-gray-100 pt-3 flex justify-between">
                        <span>${property.type}</span>
                        <span>${property.sqm} m²</span>
                    </div>
                    <a href="/nekretnina/${property.id}" class="flex w-full items-center justify-center rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-500 hover:text-gray-900 !text-white hover:!text-gray-900 no-underline">
                        Pogledaj oglas
                    </a>
                </div>
            `;

			// Vezivanje Leaflet popupa
			const marker = L.marker([property.lat, property.lng], { icon: priceIcon });

			marker.on('click', (e) => {
				// 1. Postavljamo nekretninu za mobilni drawer
				selectedProperty = property;

				// 2. Ako je ekran širi od 768px (Desktop), otvaramo Leaflet oblačić
				if (window.innerWidth >= 768) {
					L.popup({
						className: 'custom-property-popup',
						minWidth: 260,
						offset: [0, -36] // Pomak iznad špica
					})
						.setLatLng([property.lat, property.lng])
						.setContent(popupHtml)
						.openOn(map);
				} else {
					// Na mobitelu centriramo mapu malo niže kako marker ne bi bio skriven iza drawera
					map.setView([property.lat - 0.02, property.lng], map.getZoom(), { animate: true });
				}
			});

			markersGroup.addLayer(marker);
		});
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
	/>
	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
	/>
	<style>
		/* Modifikacija Leaflet oblačića kako bi izgledao kao moderan Tailwind element */
		.custom-property-popup .leaflet-popup-content-wrapper {
			border-radius: 1rem;
			box-shadow:
				0 10px 25px -5px rgba(0, 0, 0, 0.1),
				0 8px 10px -6px rgba(0, 0, 0, 0.1);
		}
		.custom-property-popup .leaflet-popup-content {
			margin: 14px;
		}
		.custom-property-popup .leaflet-popup-tip {
			box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
		}
	</style>
</svelte:head>

<!-- Glavni kontejner proteže se preko cijelog ekrana ispod headera -->
<div class="relative flex h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100 font-sans">
	<div class="absolute inset-0" bind:this={mapElement}></div>

	<!-- UI Overlay Kontrole -->
	<div
		class="absolute top-5 left-1 z-[500] flex flex-wrap items-center justify-center gap-1 md:left-5 md:gap-3"
	>
		<!-- Toggle Prodaja / Najam -->
		<div class="flex rounded-xl border border-gray-200 bg-white p-1 shadow-md">
			<button
				class="rounded-lg px-5 py-1.5 text-sm font-bold transition-colors {filterStatus === 'sale'
					? 'bg-gray-900 text-white shadow-sm'
					: 'text-gray-500 hover:text-gray-900'}"
				onclick={() => (filterStatus = 'sale')}
			>
				Prodaja
			</button>
			<button
				class="rounded-lg px-5 py-1.5 text-sm font-bold transition-colors {filterStatus === 'rent'
					? 'bg-gray-900 text-white shadow-sm'
					: 'text-gray-500 hover:text-gray-900'}"
				onclick={() => (filterStatus = 'rent')}
			>
				Najam
			</button>
		</div>

		<!-- Filter Gumb -->
		<div class="relative">
			<button
				class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-bold text-gray-800 shadow-md transition-colors hover:bg-gray-50 hover:text-yellow-600"
				onclick={() => (isFilterOpen = !isFilterOpen)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
					/></svg
				>
				<p class="hidden md:inline">Filteri</p>
			</button>

			<!-- Filter Dropdown -->
			{#if isFilterOpen}
				<div
					class="absolute top-14 left-0 w-80 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl"
				>
					<div class="mb-5 flex items-center justify-between">
						<h3 class="text-lg font-bold text-gray-900">Filteri</h3>
						<button
							class="text-sm font-semibold text-gray-500 underline hover:text-yellow-600"
							onclick={() => {
								minPrice = null;
								maxPrice = null;
								minSqm = null;
								maxSqm = null;
								Object.keys(typeFilters).forEach((k) => (typeFilters[k] = true));
							}}>Poništi</button
						>
					</div>

					<div class="space-y-6">
						<!-- Vrsta nekretnine -->
						<div>
							<label class="mb-3 block text-sm font-bold text-gray-700">Tip nekretnine</label>
							<div class="grid grid-cols-2 gap-3">
								{#each Object.keys(typeFilters) as type}
									<label class="group flex cursor-pointer items-center gap-2 text-sm">
										<input
											type="checkbox"
											bind:checked={typeFilters[type]}
											class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
										/>
										<span class="transition-colors group-hover:text-yellow-700">{type}</span>
									</label>
								{/each}
							</div>
						</div>

						<!-- Cijena -->
						<div>
							<label class="mb-3 block text-sm font-bold text-gray-700">Cijena (€)</label>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label for="minPrice" class="mb-1.5 block text-xs font-medium text-gray-500"
										>Od</label
									>
									<input
										id="minPrice"
										type="number"
										min="0"
										value={minPrice ?? ''}
										placeholder="Min"
										oninput={(e) => onFilterNumberInput((v) => (minPrice = v), e)}
										class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
									/>
								</div>
								<div>
									<label for="maxPrice" class="mb-1.5 block text-xs font-medium text-gray-500"
										>Do</label
									>
									<input
										id="maxPrice"
										type="number"
										min="0"
										value={maxPrice ?? ''}
										placeholder="Max"
										oninput={(e) => onFilterNumberInput((v) => (maxPrice = v), e)}
										class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
									/>
								</div>
							</div>
						</div>

						<!-- Kvadratura -->
						<div>
							<label class="mb-3 block text-sm font-bold text-gray-700">Površina (m²)</label>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label for="minSqm" class="mb-1.5 block text-xs font-medium text-gray-500"
										>Od</label
									>
									<input
										id="minSqm"
										type="number"
										min="0"
										value={minSqm ?? ''}
										placeholder="Min"
										oninput={(e) => onFilterNumberInput((v) => (minSqm = v), e)}
										class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
									/>
								</div>
								<div>
									<label for="maxSqm" class="mb-1.5 block text-xs font-medium text-gray-500"
										>Do</label
									>
									<input
										id="maxSqm"
										type="number"
										min="0"
										value={maxSqm ?? ''}
										placeholder="Max"
										oninput={(e) => onFilterNumberInput((v) => (maxSqm = v), e)}
										class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
									/>
								</div>
							</div>
						</div>
					</div>

					<button
						class="mt-8 w-full rounded-xl bg-black py-3 font-bold text-white shadow-md transition-colors hover:bg-yellow-500 hover:text-black"
						onclick={() => (isFilterOpen = false)}
					>
						Prikaži {filteredProperties.length} rezultata
					</button>
				</div>
			{/if}
		</div>

		<!-- Map Style Toggle -->
		<button
			class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-bold text-gray-800 shadow-md transition-colors hover:bg-gray-50 hover:text-yellow-600"
			onclick={toggleMapStyle}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p class="hidden md:inline">{mapStyle === 'street' ? 'Satelit' : 'Ulice'}</p>
		</button>
	</div>
	<!-- MOBILNI DRAWER (Prikazuje se samo na mobitelima) -->
	<!-- Zatamnjenje pozadine (Backdrop) -->
	{#if selectedProperty}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute inset-0 z-[999] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
			onclick={() => (selectedProperty = null)}
		></div>
	{/if}
	<aside
		class="absolute bottom-0 left-0 z-[1000] w-full overflow-y-auto rounded-t-3xl bg-white p-0 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out md:hidden
        {selectedProperty ? 'max-h-[85vh] translate-y-0' : 'translate-y-full'}"
	>
		{#if selectedProperty}
			<button
				class="absolute top-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white transition-colors hover:text-yellow-500"
				onclick={() => (selectedProperty = null)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/></svg
				>
			</button>

			<div class="relative aspect-video w-full bg-gray-200">
				<img
					src={selectedProperty.image}
					alt={selectedProperty.title}
					class="h-full w-full object-cover"
				/>
				<span
					class="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold tracking-wider text-black uppercase shadow-sm backdrop-blur-sm"
				>
					{selectedProperty.status === 'rent' ? 'Najam' : 'Prodaja'}
				</span>
				<span
					class="absolute right-3 bottom-3 rounded-full {typeColorMap[
						selectedProperty.type
					]} px-3 py-1 text-xs font-bold tracking-wider text-white shadow-sm"
				>
					{selectedProperty.type}
				</span>
			</div>

			<div class="p-5">
				<div class="mb-5 pb-2">
					<h2 class="m-0 mb-1 text-2xl font-bold text-gray-900">{selectedProperty.title}</h2>
					<p class="m-0 text-xl font-extrabold text-yellow-600">
						{formatFullPrice(selectedProperty.price)}
						<span class="text-sm font-medium text-gray-500"
							>{selectedProperty.status === 'rent' ? '/ mj.' : ''}</span
						>
					</p>
					<div class="mt-2 flex gap-4 text-sm font-medium text-gray-600">
						<span>{selectedProperty.type}</span>
						<span>•</span>
						<span>{selectedProperty.sqm} m²</span>
					</div>
				</div>
				<a
					href="/nekretnina/{selectedProperty.id}"
					class="flex w-full items-center justify-center rounded-xl bg-gray-900 py-3.5 text-base font-bold text-white no-underline shadow-sm transition-colors hover:bg-yellow-500 hover:text-gray-900"
				>
					Pogledaj oglas
				</a>
			</div>
		{/if}
	</aside>
</div>
