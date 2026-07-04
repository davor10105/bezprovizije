<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { getAttributeFieldsGrouped } from '$lib/properties/schema';
	import type { AttributeField } from '$lib/properties/schema';
	import type { PropertyType } from '$lib/types/property';

	let { data } = $props();

	const property = $derived(data.property);
	const ownerInfo = $derived({
		fullName: data.owner?.full_name ?? 'Oglašivač',
		phone: data.owner?.phone ?? '',
		email: data.owner?.email ?? '',
		publishedDate: new Date(property.created_at).toLocaleDateString('hr-HR'),
		adCode: property.id.slice(0, 8).toUpperCase()
	});

	let contactRevealed = $state(false);
	let favLoading = $state(false);
	let shareCopied = $state(false);

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

	type AttributeDisplayGroup = {
		category: string;
		rows: { label: string; value: string; unit?: string }[];
		features: string[];
	};

	function isTruthyBoolean(val: unknown): boolean {
		return val === true || val === 'true';
	}

	function formatNonBooleanValue(field: AttributeField, val: unknown): string | null {
		if (val === '' || val === null || val === undefined) return null;
		if (field.type === 'boolean') return null;
		return String(val);
	}

	let attributeGroups = $derived.by(() => {
		const prop = property;
		const propertyType = data.property.property_type as PropertyType;
		const listingType = prop.status as 'sale' | 'rent';
		const topLevel: Record<string, unknown> = {
			sqm: prop.sqm,
			rooms: prop.rooms,
			bathrooms: prop.bathrooms,
			build_year: prop.build_year,
			parking_spaces: prop.parking_spaces
		};
		const attrRecord = prop.attributes as Record<string, unknown>;
		const groups: AttributeDisplayGroup[] = [];

		for (const group of getAttributeFieldsGrouped(propertyType, listingType)) {
			const rows: AttributeDisplayGroup['rows'] = [];
			const features: string[] = [];

			if (group.category.key === 'basic') {
				rows.push({ label: 'Površina', value: String(prop.sqm), unit: ' m²' });
			}

			for (const field of group.fields) {
				const raw = attrRecord[field.key] ?? topLevel[field.key];

				if (field.type === 'boolean') {
					if (isTruthyBoolean(raw)) features.push(field.label);
					continue;
				}

				const formatted = formatNonBooleanValue(field, raw);
				if (formatted !== null) {
					rows.push({ label: field.label, value: formatted });
				}
			}

			if (rows.length > 0 || features.length > 0) {
				groups.push({
					category: group.category.label,
					rows,
					features
				});
			}
		}

		return groups;
	});

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);
	};

	async function copyShareLink() {
		try {
			await navigator.clipboard.writeText(page.url.href);
			shareCopied = true;
			setTimeout(() => {
				shareCopied = false;
			}, 2000);
		} catch {
			shareCopied = false;
		}
	}

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

<div class="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:py-8">
	{#if updated}
		<div class="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
			Promjene su uspješno spremljene.
		</div>
	{/if}
	{#if published}
		<div class="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
			Oglas je uspješno objavljen!
		</div>
	{/if}
	{#if pending}
		<div class="mb-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800" role="status">
			Oglas je poslan na odobrenje. Bit će vidljiv javnosti nakon što ga administrator odobri.
		</div>
	{/if}
	{#if data.property.approval_status === 'rejected' && (data.isOwner || data.isAdmin)}
		<div class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
			Ovaj oglas je odbijen i nije vidljiv javnosti.
		</div>
	{/if}
	{#if data.property.approval_status === 'pending' && (data.isOwner || data.isAdmin) && !pending}
		<div class="mb-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800" role="status">
			Oglas čeka odobrenje administratora.
		</div>
	{/if}

	<div class="flex flex-col">
		<!-- Galerija: prva na mobitelu -->
		<div class="order-1 mb-4 md:order-2 md:mb-6">
			<div class="group relative mx-auto w-full overflow-hidden rounded-2xl shadow-md">
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

		<!-- Naslov i meta -->
		<div class="order-2 mb-5 md:order-1 md:mb-4">
			<h1
				class="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-left"
			>
				{property.title}
			</h1>

			<div class="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase"
					>
						{property.status === 'rent' ? 'Najam' : 'Prodaja'}
					</span>
					<span
						class="rounded-full border border-yellow-200 bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700"
					>
						{property.type}
					</span>
				</div>
				<span class="text-2xl font-extrabold text-yellow-500 md:text-3xl lg:text-4xl">
					{formatPrice(property.price)}
					{#if property.status === 'rent'}
						<span class="text-base font-bold text-gray-400 md:text-lg">/ mj.</span>
					{/if}
				</span>
			</div>

			<p class="mt-2 flex items-center text-base font-medium text-gray-500">
				<svg
					class="mr-1.5 h-5 w-5 shrink-0 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
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

			<div class="mt-3 flex flex-wrap gap-2">
				{#if data.isLoggedIn}
					<form
						method="post"
						action={data.isFavorited ? '?/unfavorite' : '?/favorite'}
						use:enhance={() => {
							favLoading = true;
							return async ({ update }) => {
								await update({ reset: false });
								await invalidateAll();
								favLoading = false;
							};
						}}
					>
						<button
							type="submit"
							disabled={favLoading}
							class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition disabled:opacity-60 {data.isFavorited
								? 'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
								: 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300 hover:text-yellow-700'}"
						>
							<svg
								class="h-4 w-4 {data.isFavorited ? 'fill-yellow-500 text-yellow-500' : 'fill-none'}"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
							{data.isFavorited ? 'Spremljeno u favorite' : 'Spremi u favorite'}
						</button>
					</form>
				{:else}
					<a
						href="/prijava?action=login"
						class="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-yellow-300 hover:text-yellow-700"
					>
						<svg class="h-4 w-4 fill-none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
							/>
						</svg>
						Spremi u favorite
					</a>
				{/if}

				<button
					type="button"
					onclick={copyShareLink}
					class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold transition {shareCopied
						? 'border-green-500 bg-green-50 text-green-700'
						: 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300 hover:text-yellow-700'}"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
					{shareCopied ? 'Link kopiran!' : 'Podijeli'}
				</button>
			</div>
		</div>

		<!-- Sadržaj -->
		<div class="order-3 space-y-6">
			{#if attributeGroups.length > 0}
				<section class="space-y-5">
					<h2 class="text-lg font-bold text-gray-900">Značajke</h2>
					{#each attributeGroups as group (group.category)}
						<div>
							<h3 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">
								{group.category}
							</h3>
							{#if group.rows.length > 0}
								<dl class="mt-2 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
									{#each group.rows as row (row.label)}
										<div
											class="flex items-baseline justify-between gap-4 border-b border-gray-100 py-2 text-sm"
										>
											<dt class="text-gray-500">{row.label}</dt>
											<dd class="text-right font-medium text-gray-900">
												{row.value}{row.unit ?? ''}
											</dd>
										</div>
									{/each}
								</dl>
							{/if}
							{#if group.features.length > 0}
								<ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
									{#each group.features as feature (feature)}
										<li class="flex items-center gap-1.5 text-sm text-gray-800">
											<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500"></span>
											{feature}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</section>
			{/if}

			<section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
				<h2 class="mb-3 text-lg font-bold text-gray-900">Opis nekretnine</h2>
				<div class="prose prose-base max-w-none leading-relaxed whitespace-pre-line text-gray-600">
					{property.description}
				</div>
			</section>

			<div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
				<div class="min-h-[320px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
					<div
						bind:this={mapElement}
						class="relative z-0 h-full min-h-[320px] w-full rounded-xl"
					></div>
				</div>

				<div
					class="flex min-h-[320px] flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
				>
					<h2 class="mb-4 text-lg font-bold text-gray-900">Informacije o oglašivaču</h2>

					<div class="mb-4 flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-lg font-bold text-yellow-600"
						>
							{ownerInfo.fullName
								.split(' ')
								.map((n) => n[0])
								.join('')
								.slice(0, 2)}
						</div>
						<div>
							<p class="font-bold text-gray-900">{ownerInfo.fullName}</p>
							<p class="text-sm text-gray-500">Objavljeno {ownerInfo.publishedDate}</p>
						</div>
					</div>

					<div class="mt-auto">
						{#if contactRevealed}
							<div class="space-y-3">
								{#if ownerInfo.phone}
									<div class="flex items-center gap-3 text-gray-600">
										<div
											class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50"
										>
											<svg
												class="h-4 w-4 text-yellow-500"
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
											class="font-medium transition-colors hover:text-yellow-600"
											>{ownerInfo.phone}</a
										>
									</div>
								{/if}
								{#if ownerInfo.email}
									<div class="flex items-center gap-3 text-gray-600">
										<div
											class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50"
										>
											<svg
												class="h-4 w-4 text-yellow-500"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/></svg
											>
										</div>
										<a
											href="mailto:{ownerInfo.email}"
											class="font-medium break-all transition-colors hover:text-yellow-600"
											>{ownerInfo.email}</a
										>
									</div>
								{/if}
								{#if !ownerInfo.phone && !ownerInfo.email}
									<p class="text-sm text-gray-500">Kontakt podaci nisu dostupni.</p>
								{/if}
							</div>
						{:else}
							<button
								type="button"
								onclick={() => (contactRevealed = true)}
								class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-yellow-600"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
									/>
								</svg>
								Kontakt informacije
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
