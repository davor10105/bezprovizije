<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Pagination from '$lib/Pagination.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Blog i savjeti | Bez provizije</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
	<div class="mb-12 border-b border-gray-200 pb-10 text-center md:mb-16">
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
				Blog i savjeti
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-gray-600 md:mt-2 md:text-xl">
				Sve što trebate znati o tržištu nekretnina, pravnim procedurama, uređenju i financiranju na
				jednom mjestu.
			</p>
			{#if data.isAdmin}
				<a
					href="/blog/novi"
					class="rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-yellow-600"
				>
					+ Novi članak
				</a>
			{/if}
		</div>
	</div>

	{#if form?.message}
		<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
	{/if}

	{#if data.blogs.length === 0}
		<p class="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500">
			{#if data.isAdmin}
				Još nema članaka. Kreirajte prvi članak.
			{:else}
				Trenutno nema objavljenih članaka.
			{/if}
		</p>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
			{#each data.blogs as blog (blog.id)}
				<div
					class="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
				>
					<div>
						<div
							class="mb-4 flex items-center justify-between text-xs font-semibold tracking-wider text-gray-500 uppercase"
						>
							{#if data.isAdmin && !blog.is_published}
								<span class="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Skica</span>
							{:else}
								<span class="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700">Članak</span>
							{/if}
							<span>{blog.date}</span>
						</div>

						{#if blog.coverImage}
							<img
								src={blog.coverImage}
								alt=""
								class="mb-4 h-40 w-full rounded-xl object-cover"
							/>
						{/if}

						<h3
							class="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-yellow-600"
						>
							{blog.title}
						</h3>
						<p class="line-clamp-3 leading-relaxed text-gray-600">
							{blog.description}
						</p>
					</div>

					<div class="mt-8 flex flex-wrap items-center gap-4">
						<a
							href="/blog/{blog.slug}"
							class="inline-flex w-fit items-center gap-1.5 font-bold text-yellow-500 transition-colors hover:text-yellow-700"
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

						{#if data.isAdmin}
							<a
								href="/blog/uredi/{blog.slug}"
								class="text-sm font-semibold text-gray-600 hover:text-yellow-700"
							>
								Uredi
							</a>
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => async ({ update }) => {
									if (!confirm('Obrisati ovaj članak?')) return;
									await update();
									await invalidateAll();
								}}
							>
								<input type="hidden" name="id" value={blog.id} />
								<button type="submit" class="text-sm font-semibold text-red-600 hover:underline">
									Obriši
								</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div>
			<Pagination
				currentPage={data.pagination.page}
				totalPages={data.pagination.totalPages}
				paramName="page"
			/>
		</div>
	{/if}
</div>
