<script lang="ts">
	// --- MOCK PODACI ---
	// Proširena lista blogova za demonstraciju paginacije
	const allBlogs = [
		{
			id: 1,
			category: 'Kupnja',
			date: '15. tra 2026.',
			title: 'Vodič za kupnju prve nekretnine',
			excerpt:
				'Sve što trebate znati o proceduri, papirologiji i skrivenim troškovima pri kupnji vašeg prvog doma.',
			link: '/blog/vodic-kupnja-prve-nekretnine'
		},
		{
			id: 2,
			category: 'Prodaja',
			date: '10. tra 2026.',
			title: 'Kako pravilno formirati cijenu za prodaju?',
			excerpt:
				'Naučite kako procijeniti vrijednost svoje nekretnine i postaviti konkurentnu cijenu koja privlači kupce.',
			link: '/blog/kako-formirati-cijenu'
		},
		{
			id: 3,
			category: 'Najam',
			date: '5. tra 2026.',
			title: 'Najam stana: Koja su vaša prava i obveze?',
			excerpt:
				'Detaljan pregled zakonskih okvira, ugovora o najmu i savjeti za miran odnos između najmodavca i najmoprimca.',
			link: '/blog/prava-obveze-najam'
		},
		{
			id: 4,
			category: 'Savjeti',
			date: '28. ožu 2026.',
			title: 'Priprema nekretnine za slikanje (Home Staging)',
			excerpt:
				'Mali trikovi koji čine veliku razliku. Saznajte kako urediti prostor da izgleda savršeno na fotografijama.',
			link: '/blog/priprema-nekretnine-slikanje'
		},
		{
			id: 5,
			category: 'Pravni savjeti',
			date: '20. ožu 2026.',
			title: 'Što je uporabna dozvola i zašto je važna?',
			excerpt:
				'Bez uporabne dozvole prodaja ili kupnja putem kredita može biti nemoguća. Saznajte kako do nje.',
			link: '/blog/uporabna-dozvola'
		},
		{
			id: 6,
			category: 'Financije',
			date: '12. ožu 2026.',
			title: 'APN krediti: Kako se pripremiti za prijavu?',
			excerpt:
				'Prikupljanje dokumentacije za državne subvencije može biti stresno. Ovdje je korak-po-korak vodič.',
			link: '/blog/apn-krediti-priprema'
		},
		{
			id: 7,
			category: 'Uređenje',
			date: '5. ožu 2026.',
			title: 'Trendovi u uređenju interijera za 2026. godinu',
			excerpt:
				'Otkrijte koje boje, materijali i stilovi dominiraju tržištem nekretnina ove godine.',
			link: '/blog/trendovi-interijeri-2026'
		},
		{
			id: 8,
			category: 'Prodaja',
			date: '28. vel 2026.',
			title: 'Kako napisati oglas koji prodaje nekretninu?',
			excerpt:
				'Naslov, opis i ključne informacije koje kupci traže. Naučite se istaknuti u moru oglasa.',
			link: '/blog/kako-napisati-oglas'
		}
	];

	// --- STATE ZA PAGINACIJU ---
	let currentPage = $state(1);
	const itemsPerPage = 6;

	// --- IZVEDENE VRIJEDNOSTI (DERIVED) ---
	let totalPages = $derived(Math.ceil(allBlogs.length / itemsPerPage));
	let paginatedBlogs = $derived(
		allBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Funkcija za pomicanje na vrh stranice pri promjeni stranice
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
	<!-- Hero / Zaglavlje stranice -->
	<div class="mb-12 border-b border-gray-200 pb-10 text-center md:mb-16">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
			Blog i savjeti
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 md:mt-6 md:text-xl">
			Sve što trebate znati o tržištu nekretnina, pravnim procedurama, uređenju i financiranju na
			jednom mjestu.
		</p>
	</div>

	<!-- Grid s karticama -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
		{#each paginatedBlogs as blog (blog.id)}
			<div
				class="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
			>
				<div>
					<!-- Kategorija i Datum -->
					<div
						class="mb-4 flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase"
					>
						<span class="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700">
							{blog.category}
						</span>
						<span>{blog.date}</span>
					</div>

					<!-- Naslov i Excerpt -->
					<h3
						class="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-yellow-600"
					>
						{blog.title}
					</h3>
					<p class="line-clamp-3 leading-relaxed text-gray-600">
						{blog.excerpt}
					</p>
				</div>

				<!-- Link "Pročitaj više" -->
				<a
					href={blog.link}
					class="mt-8 inline-flex w-fit items-center gap-1.5 font-bold text-yellow-500 transition-colors hover:text-yellow-700"
				>
					Pročitaj više
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 transition-transform group-hover:translate-x-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						/>
					</svg>
				</a>
			</div>
		{/each}
	</div>

	<!-- Paginacija -->
	{#if totalPages > 1}
		<div class="mt-16 flex items-center justify-center gap-2">
			<!-- Prethodna -->
			<button
				class="flex h-12 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
				disabled={currentPage === 1}
				onclick={() => {
					currentPage -= 1;
					scrollToTop();
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1.5 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				<span class="hidden sm:inline">Prethodna</span>
			</button>

			<!-- Brojevi stranica -->
			<div class="flex items-center gap-1 sm:gap-2">
				{#each Array(totalPages) as _, i}
					<button
						class="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold transition-colors
                            {currentPage === i + 1
							? 'bg-gray-900 text-white shadow-md'
							: 'text-gray-600 hover:bg-gray-100'}"
						onclick={() => {
							currentPage = i + 1;
							scrollToTop();
						}}
					>
						{i + 1}
					</button>
				{/each}
			</div>

			<!-- Sljedeća -->
			<button
				class="flex h-12 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
				disabled={currentPage === totalPages}
				onclick={() => {
					currentPage += 1;
					scrollToTop();
				}}
			>
				<span class="hidden sm:inline">Sljedeća</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="ml-1.5 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	{/if}
</div>
