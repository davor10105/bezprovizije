<script lang="ts">
	// Definiramo sve podatke koje komponenta prima
	interface Props {
		title: string;
		price: number;
		location: string;
		sqm: number;
		bedrooms?: number;
		bathrooms?: number;
		image: string;
		status: 'sale' | 'rent';
		type: string;
	}

	// Svelte 5 $props() runa s defaultnim vrijednostima za sobe/kupaonice
	let {
		title,
		price,
		location,
		sqm,
		bedrooms = 1,
		bathrooms = 1,
		image,
		status,
		type
	}: Props = $props();

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('hr-HR', {
			style: 'currency',
			currency: 'EUR',
			maximumFractionDigits: 0
		}).format(price);
	};
</script>

<a
	href="/nekretnina/1"
	class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl"
>
	<div class="relative h-56 w-full overflow-hidden">
		<img
			src={image}
			alt={title}
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
		/>

		<div
			class="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold tracking-wider text-yellow-900 uppercase shadow-sm backdrop-blur-sm"
		>
			{status === 'rent' ? 'Najam' : 'Prodaja'}
		</div>

		<div
			class="absolute bottom-3 left-3 rounded-lg bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
		>
			{type}
		</div>
	</div>

	<div class="flex flex-1 flex-col justify-between p-5">
		<div class="flex flex-col gap-1">
			<h3 class="line-clamp-1 text-xl font-bold text-gray-900">{title}</h3>

			<p class="mt-1 flex items-center text-sm text-gray-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1.5 h-4 w-4 shrink-0 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				{location}
			</p>

			<p class="mt-3 text-2xl font-extrabold text-yellow-500">{formatPrice(price)}</p>
		</div>

		<div
			class="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600"
		>
			<div class="flex items-center gap-1.5" title="Kvadratura">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
					/>
				</svg>
				<span class="font-semibold text-gray-800">{sqm} m²</span>
			</div>

			<div class="flex items-center gap-1.5" title="Spavaće sobe">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				<span class="font-semibold text-gray-800">{bedrooms}</span>
			</div>

			<div class="flex items-center gap-1.5" title="Kupaonice">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
				<span class="font-semibold text-gray-800">{bathrooms}</span>
			</div>
		</div>
	</div>
</a>
