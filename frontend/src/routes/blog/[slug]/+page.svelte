<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.blog.title} | Blog | Bez provizije</title>
	<meta name="description" content={data.blog.description} />
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
	<header class="mb-10 border-b border-gray-200 pb-8">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<a href="/blog" class="text-sm font-semibold text-yellow-600 hover:text-yellow-800">
				← Natrag na blog
			</a>
			{#if data.isAdmin}
				<div class="flex items-center gap-3">
					{#if !data.blog.is_published}
						<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							Skica
						</span>
					{/if}
					<a
						href="/blog/uredi/{data.blog.slug}"
						class="text-sm font-semibold text-gray-700 hover:text-yellow-700"
					>
						Uredi
					</a>
				</div>
			{/if}
		</div>

		<p class="text-sm font-medium text-gray-500">{data.blog.date}</p>
		<h1 class="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
			{data.blog.title}
		</h1>
		<p class="mt-4 text-lg leading-relaxed text-gray-600">{data.blog.description}</p>
	</header>

	{#if data.blog.coverImage}
		<img
			src={data.blog.coverImage}
			alt=""
			class="mb-10 w-full rounded-2xl object-cover shadow-sm"
		/>
	{/if}

	<div
		class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-yellow-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
	>
		{@html data.blog.html}
	</div>
</article>
