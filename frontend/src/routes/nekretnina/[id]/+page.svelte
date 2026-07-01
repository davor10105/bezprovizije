<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { data } = $props();

	const property = $derived(data.property);
	const ownerInfo = $derived({
		fullName: data.owner?.full_name ?? 'Oglašivač',
		phone: data.owner?.phone ?? '',
		publishedDate: new Date(property.created_at).toLocaleDateString('hr-HR'),
		adCode: property.id.slice(0, 8).toUpperCase()
	});

	const published = page.url.searchParams.get('published') === '1';
	const pending = page.url.searchParams.get('pending') === '1';
	const updated = page.url.searchParams.get('updated') === '1';

	// --- CAROUSEL STATE ---
	let currentImageIndex = $state(0);

	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % property.images.length;
	}

	function prevImage() {
		currentImageIndex = (currentImageIndex - 1 + property.images.length) % property.images.length;
	}

	function goToImage(index: number) {
		currentImageIndex = index;
	}

	let displayAttributes = $derived.by(() => {
		const attrs: { label: string; value: string | number; unit: string }[] = [
			{ label: 'Površina', value: property.sqm, unit: 'm²' }
		];
		if (property.rooms != null) attrs.push({ label: 'Broj soba', value: property.rooms, unit: '' });
		if (property.bathrooms != null)
			attrs.push({ label: 'Kupaonice', value: property.bathrooms, unit: '' });
		if (property.build_year != null)
			attrs.push({ label: 'Godina gradnje', value: property.build_year, unit: '' });
		if (property.parking_spaces != null)
			attrs.push({ label: 'Parkirna mjesta', value: property.parking_spaces, unit: '' });

		const attrRecord = property.attributes as Record<string, string | number | boolean>;
		for (const [key, val] of Object.entries(attrRecord)) {
			if (val === '' || val === null || val === undefined) continue;
			const label = key.replace(/_/g, ' ');
			const displayVal = typeof val === 'boolean' ? (val ? 'Da' : 'Ne') : val;
			attrs.push({ label, value: displayVal, unit: '' });
		}
		return attrs;
	});

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);
	};

	// --- SWIPE LOGIKA ---
	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}

	function handleSwipe() {
		const swipeThreshold = 50; // Minimalna udaljenost u pikselima da bi se priznao swipe

		if (touchStartX - touchEndX > swipeThreshold) {
			nextImage(); // Swipe ulijevo -> sljedeća slika
		}
		if (touchEndX - touchStartX > swipeThreshold) {
			prevImage(); // Swipe udesno -> prethodna slika
		}
	}

	// --- LEAFLET MAPA ---
	let mapElement: HTMLElement | undefined = $state();

	onMount(async () => {
		if (!mapElement) return;
		const prop = data.property;
		const leaflet = await import('leaflet');
		const L = leaflet.default || leaflet;

		const map = L.map(mapElement, { zoomControl: false, scrollWheelZoom: true }).setView(
			[prop.lat, prop.lng],
			15
		);
		L.control.zoom({ position: 'topright' }).addTo(map);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(map);

		const markerIcon = L.divIcon({
			className: '!bg-transparent !border-none',
			html: `<div class="relative flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform duration-300">
                        <div class="absolute -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white"></div>
                   </div>`,
			iconSize: [48, 48],
			iconAnchor: [24, 48]
		});

		L.marker([prop.lat, prop.lng], { icon: markerIcon }).addTo(map);
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
	{#if updated}
		<div class="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
			Promjene su uspješno spremljene.
		</div>
	{/if}
	{#if published}
		<div class="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
			Oglas je uspješno objavljen!
		</div>
	{/if}
	{#if pending}
		<div class="mb-6 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800" role="status">
			Oglas je poslan na odobrenje. Bit će vidljiv javnosti nakon što ga administrator odobri.
		</div>
	{/if}
	{#if data.property.approval_status === 'rejected' && (data.isOwner || data.isAdmin)}
		<div class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
			Ovaj oglas je odbijen i nije vidljiv javnosti.
		</div>
	{/if}
	{#if data.property.approval_status === 'pending' && (data.isOwner || data.isAdmin) && !pending}
		<div class="mb-6 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800" role="status">
			Oglas čeka odobrenje administratora.
		</div>
	{/if}
	<!-- HEADER -->
	<div class="mb-8 text-center md:text-left">
		<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div class="inline-flex items-center justify-center gap-3 md:justify-start">
				<span
					class="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-bold tracking-wider text-white uppercase shadow-md"
				>
					{property.status === 'rent' ? 'Najam' : 'Prodaja'}
				</span>
				<span
					class="rounded-full border border-yellow-200 bg-yellow-100 px-4 py-1.5 text-sm font-bold text-yellow-700 shadow-sm"
				>
					{property.type}
				</span>
			</div>
			<h2 class="text-4xl font-extrabold text-yellow-500 drop-shadow-sm md:text-5xl">
				{formatPrice(property.price)}
				{#if property.status === 'rent'}
					<span class="text-2xl font-bold text-gray-400">/ mj.</span>
				{/if}
			</h2>
		</div>
		<h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
			{property.title}
		</h1>
		<p
			class="mt-3 flex items-center justify-center text-lg font-medium text-gray-500 md:justify-start"
		>
			<svg class="mr-2 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				/><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
				/></svg
			>
			{property.address}
		</p>
	</div>

	<!-- DIREKTNO UGRAĐEN CAROUSEL -->
	<div class="mb-12">
		<div class="group relative mx-auto w-full overflow-hidden rounded-2xl shadow-lg">
			<div
				class="aspect-square w-full bg-gray-100 md:aspect-[16/9]"
				ontouchstart={handleTouchStart}
				ontouchend={handleTouchEnd}
			>
				<img
					src={property.images[currentImageIndex]}
					alt="Slika nekretnine {currentImageIndex + 1}"
					class="h-full w-full object-cover object-center transition-all duration-500"
					draggable="false"
				/>
			</div>

			{#if property.images.length > 1}
				<button
					onclick={prevImage}
					class="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-yellow-500 hover:text-white focus:opacity-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2.5"
						stroke="currentColor"
						class="h-5 w-5"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 19.5L8.25 12l7.5-7.5"
						/></svg
					>
				</button>

				<button
					onclick={nextImage}
					class="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-yellow-500 hover:text-white focus:opacity-100"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2.5"
						stroke="currentColor"
						class="h-5 w-5"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M8.25 4.5l7.5 7.5-7.5 7.5"
						/></svg
					>
				</button>

				<div
					class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-md"
				>
					{#each property.images as _, i}
						<button
							onclick={() => goToImage(i)}
							class="h-2 rounded-full transition-all duration-300 {currentImageIndex === i
								? 'w-6 bg-yellow-500'
								: 'w-2 bg-white/70 hover:bg-white'}"
							aria-label="Slika {i + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- GLAVNE INFORMACIJE -->
	<div class="mb-16 space-y-12">
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			<!-- Obrati pažnju: sada iteriramo samo preko displayAttributes, bez () -->
			{#each displayAttributes as attr}
				<div
					class="group rounded-3xl border border-gray-100 bg-white p-3 text-center shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-200 hover:shadow-xl"
				>
					<p
						class="text-sm font-semibold tracking-wide text-gray-400 uppercase transition-colors group-hover:text-yellow-600"
					>
						{attr.label}
					</p>
					<p class="text-md mt-2 font-black text-gray-900">
						{attr.value} <span class="text-base font-medium text-gray-500">{attr.unit}</span>
					</p>
				</div>
			{/each}
		</div>

		<!-- Opis -->
		<div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg md:p-12">
			<h2 class="mb-6 text-2xl font-extrabold text-gray-900 md:text-3xl">Opis nekretnine</h2>
			<div
				class="prose prose-lg max-w-none leading-relaxed font-medium whitespace-pre-line text-gray-600"
			>
				{property.description}
			</div>
		</div>
	</div>

	<!-- MAPA I KONTAKT OGLAŠIVAČA -->
	<div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
		<!-- MAPA -->
		<div class="h-full min-h-[400px] rounded-3xl border border-gray-100 bg-white p-2 shadow-xl">
			<div
				bind:this={mapElement}
				class="relative z-0 h-full min-h-[400px] w-full rounded-2xl"
			></div>
		</div>

		<!-- INFORMACIJE O VLASNIKU -->
		<div
			class="flex h-full min-h-[400px] flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-xl md:p-10"
		>
			<h2 class="mb-8 text-2xl font-extrabold text-gray-900">Informacije o oglašivaču</h2>

			<!-- Avatar i ime -->
			<div class="mb-8 flex items-center gap-5">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-2xl font-bold text-yellow-600 shadow-sm"
				>
					{ownerInfo.fullName
						.split(' ')
						.map((n) => n[0])
						.join('')
						.slice(0, 2)}
				</div>
				<div>
					<p class="text-xl font-bold text-gray-900">{ownerInfo.fullName}</p>
				</div>
			</div>

			<!-- Kontakt podaci -->
			<div class="mb-8 space-y-4">
				{#if ownerInfo.phone}
					<div class="flex items-center gap-4 text-gray-600">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
							<svg
								class="h-5 w-5 text-yellow-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/></svg
							>
						</div>
						<a
							href="tel:{ownerInfo.phone}"
							class="text-lg font-medium transition-colors hover:text-yellow-600"
							>{ownerInfo.phone}</a
						>
					</div>
				{/if}
			</div>

			<!-- Podaci o oglasu -->
			<div
				class="mt-auto rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm font-medium text-gray-500"
			>
				<div class="mb-3 flex justify-between border-b border-gray-200 pb-3">
					<span>Objavljeno:</span>
					<span class="font-bold text-gray-900">{ownerInfo.publishedDate}</span>
				</div>
			</div>
		</div>
	</div>
</div>
