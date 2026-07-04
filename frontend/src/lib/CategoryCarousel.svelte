<script lang="ts">
	import { goto } from '$app/navigation';
	import { DEFAULT_SEARCH_FILTERS, searchHref } from '$lib/properties/search';
	import type { PropertyType } from '$lib/types/property';

	const categories: {
		id: number;
		title: string;
		img: string;
		propertyType: PropertyType | null;
	}[] = [
		{
			id: 1,
			title: 'Stanovi',
			img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
			propertyType: 'apartment'
		},
		{
			id: 2,
			title: 'Kuće',
			img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
			propertyType: 'house'
		},
		{
			id: 3,
			title: 'Zemljišta',
			img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
			propertyType: 'land'
		},
		{
			id: 4,
			title: 'Poslovni prostori',
			img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
			propertyType: 'business'
		},
		{
			id: 5,
			title: 'Garaže',
			img: 'https://plus.unsplash.com/premium_photo-1673886205989-24c637783c60?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			propertyType: 'garage'
		},
		{
			id: 6,
			title: 'Sobe',
			img: 'https://plus.unsplash.com/premium_photo-1717026836061-32ec43465f9b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			propertyType: 'room'
		}
	];

	let currentIndex = $state(0);
	let touchStartX = $state(0);

	function next() {
		currentIndex = (currentIndex + 1) % categories.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + categories.length) % categories.length;
	}

	function getOffset(index: number) {
		let offset = index - currentIndex;
		const half = Math.floor(categories.length / 2);

		if (offset > half) offset -= categories.length;
		if (offset < -half) offset += categories.length;

		return offset;
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchEnd(e: TouchEvent) {
		const touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;

		if (diff > 50) next();
		else if (diff < -50) prev();
	}

	function openCategorySearch(propertyType: PropertyType | null) {
		goto(
			searchHref({
				...DEFAULT_SEARCH_FILTERS,
				propertyType: propertyType ?? '',
				listingType: propertyType === 'room' ? 'rent' : ''
			})
		);
	}
</script>

<div class="flex w-full flex-col items-center overflow-hidden py-10 select-none md:py-16">
	<div
		class="relative flex h-56 w-full max-w-5xl items-center justify-center sm:h-72"
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		aria-label="Category carousel"
		aria-roledescription="Carousel of categories"
	>
		{#each categories as cat, i}
			{@const offset = getOffset(i)}
			<button
				type="button"
				class="absolute h-full w-[280px] cursor-pointer overflow-hidden rounded-2xl border-0 p-0 shadow-2xl transition-all duration-500 ease-out sm:w-[400px]"
				style="
          transform: translateX({offset * 65}%) scale({1 - Math.abs(offset) * 0.2});
          opacity: {1 - Math.abs(offset) * 0.5};
          z-index: {10 - Math.abs(offset)};
          pointer-events: {Math.abs(offset) > 1 ? 'none' : 'auto'};
        "
				aria-label="Pretraži {cat.title}"
				onclick={() => openCategorySearch(cat.propertyType)}
			>
				<img src={cat.img} alt={cat.title} class="h-full w-full object-cover" />
				<div
					class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
				></div>

				<div
					class="absolute right-4 bottom-4 left-4 transition-opacity duration-300"
					style="opacity: {offset === 0 ? 1 : 0.4}"
				>
					<h3 class="text-xl font-bold text-white sm:text-2xl">{cat.title}</h3>
				</div>
			</button>
		{/each}
	</div>

	<div class="mt-8 flex items-center gap-6">
		<button
			onclick={prev}
			class="rounded-full border border-gray-100 bg-white p-3 text-gray-800 shadow-md transition-all hover:scale-110 hover:bg-gray-50 focus:outline-none"
			aria-label="Previous"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="flex gap-2">
			{#each categories as _, i}
				<button
					class="h-2.5 w-2.5 rounded-full transition-all duration-300 {i === currentIndex
						? 'w-6 bg-yellow-500'
						: 'bg-gray-300'}"
					onclick={() => (currentIndex = i)}
					aria-label="Go to slide {i + 1}"
				></button>
			{/each}
		</div>

		<button
			onclick={next}
			class="rounded-full border border-gray-100 bg-white p-3 text-gray-800 shadow-md transition-all hover:scale-110 hover:bg-gray-50 focus:outline-none"
			aria-label="Next"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>
</div>
