<script>
	import { onMount } from 'svelte';
	import SearchPublish from '$lib/SearchPublish.svelte';
	import CategoryCarousel from '$lib/CategoryCarousel.svelte';
	import PropertySummary from '$lib/PropertySummary.svelte';
	import Blogs from '$lib/Blogs.svelte';
	import logoLight from '$lib/assets/bezprovizije_logo_light.png';
	import { properties } from '$lib/dummyData';

	const categories = [
		{ title: 'Stanovi', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2' },
		{ title: 'Kuće', img: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c' },
		{ title: 'Zemljišta', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' },
		{
			title: 'Poslovni prostori',
			img: 'https://images.unsplash.com/photo-1497366216548-37526070297c'
		}
	];
	const latestProperties = properties.slice(0, 4);
</script>

<main class="min-h-screen bg-gray-50 text-gray-800">
	<SearchPublish />
	<!-- Hero -->
	<section class="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
			<div class="mx-auto flex max-w-xl flex-col items-start text-left lg:mx-0">
				<h1
					class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl md:leading-[1.1]"
				>
					Spajamo ljude s <br class="hidden sm:block" />
					<span class="text-text-secondary">njihovim domom.</span>
				</h1>

				<p class="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl">
					Oglasite prodaju svoje nekretnine ili pregledajte oglase koje su objavili isključivo
					vlasnici. Povežite se direktno, brzo i potpuno slobodno od plaćanja agencijskih provizija.
				</p>
			</div>

			<div class="w-full overflow-visible lg:ml-auto">
				<CategoryCarousel />
			</div>
		</div>
	</section>

	<!-- Newest Listings -->
	<section
		class="mx-auto flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-50 px-4 py-12 md:px-8 md:py-20"
	>
		<div class="max-w-7xl">
			<!-- <section class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20"> -->
			<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
						Najnoviji oglasi
					</h2>
					<p class="mt-2 text-lg text-gray-600">
						Pregledajte tek pristigle nekretnine iz cijele Hrvatske.
					</p>
				</div>

				<a
					href="/pretraga"
					class="group inline-flex items-center gap-1.5 text-lg font-bold text-text-secondary transition-colors hover:text-yellow-800"
				>
					Pogledaj sve
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 transition-transform group-hover:translate-x-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				</a>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:gap-8">
				{#each latestProperties as property (property.id)}
					<PropertySummary
						title={property.title}
						price={property.price}
						location={property.address}
						sqm={property.sqm}
						bedrooms={property.attributes?.numRooms}
						bathrooms={property.attributes?.numBathrooms}
						image={property.image}
						status={property.status}
						type={property.type}
					/>
				{/each}
			</div>
			<!-- </section> -->
		</div>
	</section>
	<!-- Guides Section -->
	<section class="bg-white px-4 py-2 md:px-8 md:py-4">
		<Blogs />
	</section>

	<!-- Why Section -->
	<section class="mx-auto w-full bg-black px-4 py-12 md:px-8 md:py-20">
		<div class="mx-auto flex max-w-7xl flex-col items-center md:flex-row md:gap-12">
			<!-- Zaglavlje sekcije -->
			<div class="mb-12 text-center md:mb-16">
				<h2 class="text-3xl font-bold tracking-tight text-gray-300 sm:text-4xl">
					<img src={logoLight} alt="BezProvizije Logo" class="inline h-24 w-auto" />
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
					Oglasnik koji izravno povezuje vlasnike s kupcima i najmoprimcima, čuvajući vaše vrijeme i
					novac.
				</p>
			</div>

			<!-- Grid s razlozima -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
				<!-- Razlog 1: Bez provizije -->
				<div class="flex flex-col items-start gap-4 sm:flex-row">
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/20 text-yellow-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="mb-2 text-xl font-bold text-white">0% Agencijske provizije</h3>
						<p class="leading-relaxed text-gray-400">
							Sve nekretnine oglašene su potpuno bez agencijskih provizija. Zadržite svoj novac i
							uložite ga tamo gdje je najpotrebnije – u svoj novi dom.
						</p>
					</div>
				</div>

				<!-- Razlog 2: Bez duplih oglasa -->
				<div class="flex flex-col items-start gap-4 sm:flex-row">
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/20 text-yellow-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
					</div>
					<div>
						<h3 class="mb-2 text-xl font-bold text-white">Bez ponavljanja i duplikata</h3>
						<p class="leading-relaxed text-gray-400">
							Ne ponavljamo oglase istih nekretnina. Izbjegnite tisuće agencijskih kopija s već
							prodanim nekretninama i pretražujte samo aktualne ponude.
						</p>
					</div>
				</div>

				<!-- Razlog 3: Direktan kontakt -->
				<div class="flex flex-col items-start gap-4 sm:flex-row">
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/20 text-yellow-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="mb-2 text-xl font-bold text-white">Direktan kontakt prodavatelja i kupca</h3>
						<p class="leading-relaxed text-gray-400">
							Preskočite posrednike. Stupite u kontakt izravno s vlasnicima nekretnina za brži,
							jasniji dogovor i potpuno transparentnu komunikaciju.
						</p>
					</div>
				</div>

				<!-- Razlog 4: Ušteda vremena i podrška -->
				<div class="flex flex-col items-start gap-4 sm:flex-row">
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/20 text-yellow-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="mb-2 text-xl font-bold text-white">Ušteda vremena uz stručnu podršku</h3>
						<p class="leading-relaxed text-gray-400">
							Naši članci, savjeti i ponuda stručnih usluga vode vas kroz proces. Uz nas,
							realizacija kupoprodaje ili najma postaje jednostavna i sigurna.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	a {
		cursor: pointer;
	}
</style>
