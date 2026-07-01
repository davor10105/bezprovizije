<script lang="ts">
	import rijekaFirst from '$lib/assets/rijeka3-1.jpg';
	import MapPreview from '$lib/MapPreview.svelte';
	// Stanja za formu pretrage
	let tipUsluge = $state('Prodaja');
	let tipNekretnine = $state('Stan');
	let cijenaMin = $state<number>();
	let cijenaMax = $state<number>();
	let kvadraturaMin = $state<number>();
	let kvadraturaMax = $state<number>();
	let grad = $state('');

	// Dummy podaci za padajuće izbornike
	const vrsteNekretnina = ['Kuća', 'Stan', 'Poslovni prostor', 'Garaža', 'Zemljište', 'Soba'];
	const gradovi = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Dubrovnik'];

	// Placeholder za tvoju sliku unutar desnog kontejnera
	// import oglasSlika from '$lib/assets/tvoja_slika.png';
</script>

<!-- <section
	class="relative flex min-h-[600px] w-full items-center justify-center bg-gray-100 bg-[url('/putanja/do/tvoje/pozadine.jpg')] bg-cover bg-center"
> -->
<section
	class="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden bg-gray-100"
>
	<!-- Display rijekaFirst as background image -->
	<div
		style="background-image: url({rijekaFirst});"
		class="absolute inset-0 scale-105 bg-cover bg-center blur-xs"
	></div>

	<div class="relative z-10 p-4 text-center">
		<!-- <div class="absolute inset-0 bg-black/40"></div> -->

		<div
			class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 py-12 md:flex-row md:gap-8 md:px-4"
		>
			<div class="flex-1 rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur md:p-8">
				<h1 class="mb-6 text-2xl font-bold text-gray-800 md:text-3xl">Pronađite svoj novi dom</h1>

				<form class="space-y-5" onsubmit={(e) => e.preventDefault()}>
					<div class="flex rounded-lg bg-gray-200 p-1">
						<button
							type="button"
							class="flex-1 rounded-md py-2 text-sm font-semibold transition-all {tipUsluge ===
							'Prodaja'
								? 'bg-white text-blue-900 shadow'
								: 'text-gray-600 hover:text-gray-900'}"
							onclick={() => (tipUsluge = 'Prodaja')}
						>
							Prodaja
						</button>
						<button
							type="button"
							class="flex-1 rounded-md py-2 text-sm font-semibold transition-all {tipUsluge ===
							'Najam'
								? 'bg-white text-blue-900 shadow'
								: 'text-gray-600 hover:text-gray-900'}"
							onclick={() => (tipUsluge = 'Najam')}
						>
							Najam
						</button>
					</div>

					<div>
						<label for="tipNekretnine" class="mb-1 block text-sm font-medium text-gray-700"
							>Vrsta nekretnine</label
						>
						<select
							id="tipNekretnine"
							bind:value={tipNekretnine}
							class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-blue-500 focus:ring-blue-500"
						>
							{#each vrsteNekretnina as vrsta}
								<option value={vrsta}>{vrsta}</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Cijena (€)</label>
						<div class="flex gap-3">
							<input
								type="number"
								bind:value={cijenaMin}
								placeholder="Min cijena"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-blue-500"
							/>
							<input
								type="number"
								bind:value={cijenaMax}
								placeholder="Max cijena"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">Površina (m²)</label>
						<div class="flex gap-3">
							<input
								type="number"
								bind:value={kvadraturaMin}
								placeholder="Min m²"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-blue-500"
							/>
							<input
								type="number"
								bind:value={kvadraturaMax}
								placeholder="Max m²"
								class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label for="grad" class="mb-1 block text-sm font-medium text-gray-700">Lokacija</label>
						<select
							id="grad"
							bind:value={grad}
							class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 outline-none focus:border-blue-500 focus:ring-blue-500"
						>
							<option value="" disabled selected>Odaberite grad</option>
							{#each gradovi as g}
								<option value={g}>{g}</option>
							{/each}
						</select>
					</div>

					<button
						type="submit"
						class="w-full rounded-lg bg-linear-to-r from-gray-900 to-gray-600 py-3 py-4 text-lg font-bold text-white transition-colors transition-transform hover:-translate-y-1 hover:bg-blue-700"
					>
						Pretraži nekretnine
					</button>
				</form>
			</div>

			<div
				class="flex flex-1 flex-col items-center justify-between rounded-2xl bg-white/95 p-6 text-center shadow-xl backdrop-blur md:p-8"
			>
				<h2 class="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
					Pridružite se stotinama drugih oglašivača
				</h2>
				<p class="mb-8 text-gray-600">
					Oglasite svoju nekretninu brzo, jednostavno i bez provizije.
				</p>

				<div
					class="mb-8 flex aspect-auto w-full items-center justify-center overflow-hidden rounded-xl bg-gray-200 md:aspect-video"
				>
					<MapPreview />
				</div>

				<button
					class="to--600 w-full transform rounded-xl bg-green-500 bg-linear-to-r from-blue-900 to-blue-500 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-green-600"
				>
					Objavite oglas
				</button>
			</div>
		</div>
	</div>
</section>
