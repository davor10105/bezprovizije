<script lang="ts">
	import { onMount } from 'svelte';
	import { properties } from '$lib/dummyData';

	// Tipiziramo element kao HTML div
	let mapElement: HTMLDivElement;
	let markersGroup;

	// Definiramo strukturu za naše podatke
	interface DummyProperty {
		lat: number;
		lng: number;
		price: string;
	}

	function formatMarkerPrice(price) {
		if (price >= 1000) {
			return (price / 1000).toFixed(0) + 'k €';
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

	const typeColorMap = {
		Kuća: 'bg-emerald-600',
		Stan: 'bg-blue-600',
		Zemljište: 'bg-amber-600',
		Garaža: 'bg-gray-700',
		Poslovni: 'bg-purple-600'
	};

	onMount(async () => {
		// Dinamički import za Leaflet (zbog SvelteKit SSR-a)
		const leaflet = await import('leaflet');
		const L = leaflet.default || leaflet;
		window.L = L;
		await import('leaflet.markercluster');

		// Inicijalizacija mape s isključenim interakcijama
		const map = L.map(mapElement, {
			zoomControl: false,
			dragging: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			touchZoom: false,
			boxZoom: false,
			keyboard: false
		}).setView([44.4, 16.3], 6.1);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(map);

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

		map.addLayer(markersGroup);
		// Tipiziramo array s DummyProperty sučeljem
		const dummyProperties: DummyProperty[] = properties;

		const typeColorMap = {
			Kuća: 'bg-emerald-600',
			Stan: 'bg-blue-600',
			Zemljište: 'bg-amber-600',
			Garaža: 'bg-gray-700',
			Poslovni: 'bg-purple-600'
		};

		dummyProperties.forEach((prop: DummyProperty) => {
			const baseColor = typeColorMap[prop.type] || 'bg-gray-900';
			const priceLabel = formatMarkerPrice(prop.price);
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
			const marker = L.marker([prop.lat, prop.lng], { icon: priceIcon }).addTo(map);
			markersGroup.addLayer(marker);
		});
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<a
	href="/karta"
	class="group relative block h-64 w-full overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl md:h-96"
>
	<div class="absolute inset-0 z-0" bind:this={mapElement}></div>

	<div
		class="absolute inset-0 z-1000 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
	>
		<div
			class="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
		>
			<span
				class="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-lg font-bold text-white shadow-lg md:text-xl"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
					/>
				</svg>
				Otvorite kartu
			</span>
		</div>
	</div>
</a>
