<script lang="ts">
	import { onMount } from 'svelte';

	// --- MOCK PODACI (Skraćeni radi preglednosti) ---
	const property = {
		title: 'Stara gradska vila',
		description: `Predivna kamena vila smještena u mirnom dijelu grada nudi onaj rijedak osjećaj doma koji se ne može umjetno stvoriti novim namještajem ili modernim fasadama. Njezini zidovi, građeni od klesanog kamena prije više od jednog stoljeća, čuvaju svježinu čak i tijekom najtoplijih ljetnih dana, a svaki detalj u unutrašnjosti priča svoju priču. Ovo nije tipična nekretnina za odmor u kojoj je sve podređeno fotografiranju za društvene mreže, već prostor u kojem se zaista živi, polako i bez žurbe.
Čim zakoračite kroz teška drvena vrata, osjetit ćete miris starog drva i kamena. Prizemlje je prostrano i otvoreno, s velikim blagovaonskim stolom oko kojeg su se desetljećima okupljale generacije. Kuhinja je jednostavna i funkcionalna, opremljena svime što vam treba za pripremu domaćih jela, ali bez nepotrebnih aparata koji samo zauzimaju prostor. Dnevni boravak odiše toplinom zahvaljujući niskim stropovima i udobnim naslonjačima smještenim uz prozor koji gleda na vrt.
Gornji kat namijenjen je odmoru. Spavaće sobe su prostrane, s visokim prozorima koji propuštaju točno onoliko svjetla koliko je potrebno da se ujutro probudite prirodno. Kreveti su masivni, s posteljinom od pravog pamuka koja miriše na čisto i na vjetar. Tu nema buke prometa ni užurbanosti, jedino što ćete čuti u ranim jutarnjim satima je cvrkut ptica iz obližnjeg maslinika.
Dvorište je možda najljepši dio ove vile. Nije to strogo uređen travnjak, već mali mediteranski raj u kojem smokva pruža duboki hlad, a grmovi lavande i ružmarina samoniklo rastu uz kamene staze. U kutu dvorišta nalazi se kamena klupa, idealno mjesto za ispijanje prve kave ili čitanje knjige dok sunce polako zalazi. Sve je nekako skromno, a opet bogato karakterom koji se rijetko pronalazi.
Lokacija je takva da ste dovoljno blizu centra da možete prošetati do pekare ili tržnice, a opet dovoljno izolirani da imate potpunu privatnost. Ova kuća ne nudi luksuz u modernom smislu te riječi, ona nudi mir, tišinu i autentično iskustvo života u kamenu. Idealna je za ljude koji znaju cijeniti nesavršenosti stare gradnje, škripu drvenih stepenica i hladovinu debelih zidova. Ako tražite mjesto gdje ćete se zaista isključiti iz svakodnevice i povezati s jednostavnijim načinom života, ova vila će vas dočekati onako kako dočekuje stare prijatelje.`,
		price: 2500,
		lat: 42.6507,
		lng: 18.0944,
		type: 'Kuća',
		status: 'rent',
		address: 'Industrijska 100, Dubrovnik',
		images: [
			'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
			'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
			'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
		],
		attributes: { sqm: 200, gardenSqm: 500, numRooms: 5, numBathrooms: 3, energy: 'A', pool: true }
	};

	// --- MOCK PODACI O VLASNIKU ---
	const ownerInfo = {
		firstName: 'Ivan',
		lastName: 'Horvat',
		phone: '+385 91 234 5678',
		email: 'ivan.horvat@nekretnine-primjer.hr',
		adCode: 'VIL-2026-DBK',
		publishedDate: '15.04.2026.',
		validUntil: '15.05.2026.'
	};

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

	// --- KONFIGURACIJA KLJUČNIH ATRIBUTA ---
	const keyAttributesConfig: Record<
		string,
		{ key: string; label: string; unit: string; type?: 'boolean' }[]
	> = {
		Kuća: [
			{ key: 'sqm', label: 'Površina', unit: 'm²' },
			{ key: 'gardenSqm', label: 'Okućnica', unit: 'm²' },
			{ key: 'numRooms', label: 'Broj soba', unit: '' },
			{ key: 'numBathrooms', label: 'Kupaonice', unit: '' },
			{ key: 'energy', label: 'Energetski razred', unit: '' },
			{ key: 'pool', label: 'Bazen', unit: '', type: 'boolean' }
		]
	};

	// U Svelte 5, koristimo $derived.by za kompleksniju logiku
	let displayAttributes = $derived.by(() => {
		const config = keyAttributesConfig[property.type] || [];
		return config
			.map((cfg) => {
				// @ts-ignore
				const val = property.attributes[cfg.key];
				let displayVal = val;
				if (cfg.type === 'boolean') displayVal = val ? 'Da' : 'Ne';
				return { label: cfg.label, value: displayVal, unit: cfg.unit, exists: val !== undefined };
			})
			.filter((attr) => attr.exists);
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
		const leaflet = await import('leaflet');
		const L = leaflet.default || leaflet;

		const map = L.map(mapElement, { zoomControl: false, scrollWheelZoom: true }).setView(
			[property.lat, property.lng],
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

		L.marker([property.lat, property.lng], { icon: markerIcon }).addTo(map);
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
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
					{ownerInfo.firstName[0]}{ownerInfo.lastName[0]}
				</div>
				<div>
					<p class="text-xl font-bold text-gray-900">{ownerInfo.firstName} {ownerInfo.lastName}</p>
				</div>
			</div>

			<!-- Kontakt podaci -->
			<div class="mb-8 space-y-4">
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
						class="text-lg font-medium transition-colors hover:text-yellow-600">{ownerInfo.phone}</a
					>
				</div>
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
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/></svg
						>
					</div>
					<a
						href="mailto:{ownerInfo.email}"
						class="text-lg font-medium transition-colors hover:text-yellow-600">{ownerInfo.email}</a
					>
				</div>
			</div>

			<!-- Podaci o oglasu -->
			<div
				class="mt-auto rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm font-medium text-gray-500"
			>
				<div class="mb-3 flex justify-between border-b border-gray-200 pb-3">
					<span>Šifra oglasa:</span>
					<span class="font-bold text-gray-900">{ownerInfo.adCode}</span>
				</div>
				<div class="mb-3 flex justify-between border-b border-gray-200 pb-3">
					<span>Objavljeno:</span>
					<span class="font-bold text-gray-900">{ownerInfo.publishedDate}</span>
				</div>
				<div class="flex justify-between">
					<span>Vrijedi do:</span>
					<span class="font-bold text-gray-900">{ownerInfo.validUntil}</span>
				</div>
			</div>
		</div>
	</div>
</div>
