<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { GeocodeResult } from '$lib/types/property';

	interface Props {
		address?: string;
		lat?: number | null;
		lng?: number | null;
		error?: string;
	}

	let {
		address = $bindable(''),
		lat = $bindable<number | null>(null),
		lng = $bindable<number | null>(null),
		error = ''
	}: Props = $props();

	let mapElement: HTMLDivElement;
	let map: import('leaflet').Map | undefined;
	let marker: import('leaflet').Marker | undefined;
	let L: typeof import('leaflet') | undefined;

	let searchQuery = $state('');
	let suggestions = $state<GeocodeResult[]>([]);
	let showSuggestions = $state(false);
	let searchLoading = $state(false);
	let reverseLoading = $state(false);
	let searchDebounce: ReturnType<typeof setTimeout> | undefined;

	const defaultCenter: [number, number] = [45.1, 15.2];
	const defaultZoom = 7;

	function createMarkerIcon() {
		if (!L) return undefined;
		return L.divIcon({
			className: '!bg-transparent !border-none',
			html: `<div class="flex flex-col items-center pointer-events-none">
				<div class="h-5 w-5 rounded-full bg-yellow-500 border-[3px] border-white shadow-lg"></div>
				<div class="-mt-1.5 h-2.5 w-2.5 rotate-45 bg-yellow-500 shadow-sm"></div>
			</div>`,
			iconSize: [20, 28],
			iconAnchor: [10, 28]
		});
	}

	function setMarkerPosition(newLat: number, newLng: number, panOnly = false) {
		lat = newLat;
		lng = newLng;

		if (!map || !L) return;

		if (marker) {
			marker.setLatLng([newLat, newLng]);
		} else {
			marker = L.marker([newLat, newLng], {
				draggable: true,
				icon: createMarkerIcon()
			}).addTo(map);
			marker.on('dragend', () => {
				const pos = marker?.getLatLng();
				if (pos) {
					void updateAddressFromCoords(pos.lat, pos.lng);
				}
			});
		}

		if (panOnly) {
			map.panTo([newLat, newLng]);
		} else if (map.getZoom() < 14) {
			map.setView([newLat, newLng], 14);
		} else {
			map.panTo([newLat, newLng]);
		}
	}

	async function updateAddressFromCoords(newLat: number, newLng: number) {
		lat = newLat;
		lng = newLng;
		reverseLoading = true;
		try {
			const res = await fetch(
				`/api/geocode?lat=${encodeURIComponent(newLat)}&lng=${encodeURIComponent(newLng)}`
			);
			if (res.ok) {
				const results: GeocodeResult[] = await res.json();
				if (results[0]) {
					address = results[0].short_name;
					searchQuery = results[0].short_name;
				}
			}
		} finally {
			reverseLoading = false;
		}
	}

	async function searchAddress() {
		const q = searchQuery.trim();
		if (q.length < 3) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		searchLoading = true;
		try {
			const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
			if (res.ok) {
				suggestions = await res.json();
				showSuggestions = suggestions.length > 0;
			} else {
				suggestions = [];
				showSuggestions = false;
			}
		} finally {
			searchLoading = false;
		}
	}

	function onSearchInput() {
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(searchAddress, 300);
	}

	function selectSuggestion(item: GeocodeResult) {
		address = item.short_name;
		searchQuery = item.short_name;
		showSuggestions = false;
		suggestions = [];
		setMarkerPosition(item.lat, item.lng);
	}

	function hideSuggestions() {
		setTimeout(() => {
			showSuggestions = false;
		}, 150);
	}

	onMount(async () => {
		const leaflet = await import('leaflet');
		L = leaflet.default || leaflet;

		const initialLat = lat ?? defaultCenter[0];
		const initialLng = lng ?? defaultCenter[1];

		map = L.map(mapElement, { zoomControl: true }).setView(
			[initialLat, initialLng],
			lat !== null && lng !== null ? 14 : defaultZoom
		);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap'
		}).addTo(map);

		map.on('click', (e) => {
			setMarkerPosition(e.latlng.lat, e.latlng.lng, true);
			void updateAddressFromCoords(e.latlng.lat, e.latlng.lng);
		});

		if (lat !== null && lng !== null) {
			setMarkerPosition(lat, lng);
		}

		if (address) {
			searchQuery = address;
		}

		requestAnimationFrame(() => map?.invalidateSize());
		setTimeout(() => map?.invalidateSize(), 100);
	});

	onDestroy(() => {
		clearTimeout(searchDebounce);
		map?.remove();
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="space-y-4">
	<div class="relative z-[1000]">
		<label for="address-search" class="block text-sm font-semibold text-gray-700">
			Adresa u Hrvatskoj
		</label>
		<input
			id="address-search"
			type="text"
			bind:value={searchQuery}
			oninput={onSearchInput}
			onfocus={() => {
				if (suggestions.length > 0) showSuggestions = true;
			}}
			onblur={hideSuggestions}
			placeholder="npr. Ilica 100, Zagreb"
			autocomplete="off"
			class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
		/>
		{#if searchLoading}
			<p class="mt-1 text-xs text-gray-500">Pretražujem adrese...</p>
		{:else if reverseLoading}
			<p class="mt-1 text-xs text-gray-500">Određujem adresu...</p>
		{/if}

		{#if showSuggestions && suggestions.length > 0}
			<ul
				class="absolute z-[1001] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl"
				role="listbox"
			>
				{#each suggestions as item (item.id)}
					<li role="option">
						<button
							type="button"
							class="w-full px-4 py-3 text-left hover:bg-yellow-50"
							onmousedown={(e) => e.preventDefault()}
							onclick={() => selectSuggestion(item)}
						>
							<span class="block text-sm font-medium text-gray-900">{item.short_name}</span>
							{#if item.short_name !== item.display_name}
								<span class="mt-0.5 block text-xs text-gray-500 line-clamp-1">
									{item.display_name}
								</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<input type="hidden" name="address" value={address || searchQuery} />

	<div
		bind:this={mapElement}
		class="relative z-0 h-80 w-full overflow-hidden rounded-2xl border border-gray-200 shadow-inner"
		role="application"
		aria-label="Karta za odabir lokacije"
	></div>

	<p class="text-xs text-gray-500">
		Kliknite na kartu ili povucite marker za točnu lokaciju. Adresu možete pretražiti iznad.
	</p>

	{#if lat !== null && lng !== null}
		<p class="text-xs text-gray-600">
			Koordinate: {lat.toFixed(5)}, {lng.toFixed(5)}
		</p>
		<input type="hidden" name="lat" value={lat} />
		<input type="hidden" name="lng" value={lng} />
	{/if}

	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div>
