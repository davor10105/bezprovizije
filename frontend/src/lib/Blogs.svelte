<script lang="ts">
	// Dummy podaci - ovdje ćeš spojiti svoje stvarne blog objave iz CMS-a ili baze
	const recentBlogs = [
		{
			id: 1,
			title: 'Vodič za kupnju prve nekretnine',
			excerpt:
				'Sve što trebate znati o proceduri, papirologiji i skrivenim troškovima pri kupnji vašeg prvog doma.',
			link: '/blog/vodic-kupnja-prve-nekretnine'
		},
		{
			id: 2,
			title: 'Kako pravilno formirati cijenu za prodaju?',
			excerpt:
				'Naučite kako procijeniti vrijednost svoje nekretnine i postaviti konkurentnu cijenu koja privlači kupce.',
			link: '/blog/kako-formirati-cijenu'
		},
		{
			id: 3,
			title: 'Najam stana: Koja su vaša prava i obveze?',
			excerpt:
				'Detaljan pregled zakonskih okvira, ugovora o najmu i savjeti za miran odnos između najmodavca i najmoprimca.',
			link: '/blog/prava-obveze-najam'
		},
		{
			id: 4,
			title: 'Priprema nekretnine za slikanje (Home Staging)',
			excerpt:
				'Mali trikovi koji čine veliku razliku. Saznajte kako urediti prostor da izgleda savršeno na fotografijama.',
			link: '/blog/priprema-nekretnine-slikanje'
		}
	];
</script>

<section class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
	<!-- Zaglavlje sekcije -->
	<div class="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
		<div class="max-w-2xl">
			<h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				Članci i savjeti
			</h2>
			<p class="mt-3 text-lg text-gray-600">
				Olakšajte si proces kupnje, prodaje ili najma uz naše stručne vodiče i korisne savjete.
			</p>
		</div>

		<!-- Gumb za sve blogove (Desktop) -->
		<a
			href="/blog"
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

	<!-- Grid s blogovima -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
		{#each recentBlogs as blog (blog.id)}
			<div
				class="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8"
			>
				<div>
					<h3
						class="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-yellow-600"
					>
						{blog.title}
					</h3>
					<p class="leading-relaxed text-gray-600">
						{blog.excerpt}
					</p>
				</div>

				<a
					href={blog.link}
					class="mt-6 inline-flex w-fit items-center gap-1.5 font-semibold text-yellow-500 transition-colors hover:text-yellow-800"
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

	<!-- Gumb za sve blogove (Mobile) -->
	<div class="mt-8 flex justify-center md:hidden">
		<a
			href="/blog"
			class="w-full rounded-xl bg-gray-900 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-gray-800"
		>
			Svi članci
		</a>
	</div>
</section>
