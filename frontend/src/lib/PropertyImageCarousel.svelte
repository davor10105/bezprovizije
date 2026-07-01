<script>
	let { images = [] } = $props();
	let currentIndex = $state(0);
	console.log(images.length);

	function next() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	}

	function goTo(index) {
		currentIndex = index;
	}
</script>

{#if images.length > 0}
	<div class="group relative mx-auto w-full max-w-7xl overflow-hidden rounded-2xl shadow-lg">
		<!-- Main Image -->
		<div class="aspect-[16/9] w-full bg-gray-100">
			<img
				src={images[currentIndex]}
				alt="Property view {currentIndex + 1}"
				class="h-full w-full object-cover object-center transition-all duration-500"
			/>
		</div>

		<!-- Navigation (Only show if there is more than 1 image) -->
		{#if images.length > 1}
			<!-- Left Arrow -->
			<button
				onclick={prev}
				class="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-yellow-500 hover:text-white focus:opacity-100"
				aria-label="Previous image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="h-5 w-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<!-- Right Arrow -->
			<button
				onclick={next}
				class="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-yellow-500 hover:text-white focus:opacity-100"
				aria-label="Next image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="h-5 w-5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			</button>

			<!-- Dot Indicators -->
			<div
				class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-md"
			>
				{#each images as _, i}
					<button
						onclick={() => goTo(i)}
						class="h-2 rounded-full transition-all duration-300 {currentIndex === i
							? 'w-6 bg-yellow-500'
							: 'w-2 bg-white/70 hover:bg-white'}"
						aria-label="Go to image {i + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- Fallback for empty image array -->
	<div
		class="flex aspect-[16/9] w-full max-w-4xl items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 text-gray-400"
	>
		<span class="text-sm font-medium">Nema dostupnih slika</span>
	</div>
{/if}
