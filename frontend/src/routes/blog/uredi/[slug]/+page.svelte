<script lang="ts">
	import { enhance } from '$app/forms';
	import BlogEditor from '$lib/BlogEditor.svelte';

	let { data, form } = $props();

	let title = $state(data.blog.title);
	let description = $state(data.blog.description);
	let content = $state(data.blog.content);

	$effect(() => {
		if (!form?.errors) return;
		const values = (form.values ?? {}) as Record<string, string>;
		if (values.title !== undefined) title = values.title;
		if (values.description !== undefined) description = values.description;
		if (values.content !== undefined) content = values.content;
	});

	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<svelte:head>
	<title>Uredi: {data.blog.title} | Blog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-12 md:px-8">
	<a href="/blog/{data.blog.slug}" class="text-sm font-semibold text-yellow-600 hover:text-yellow-800">
		← Natrag na članak
	</a>

	<h1 class="mt-4 text-3xl font-extrabold text-gray-900">Uredi članak</h1>

	{#if errors.form}
		<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p>
	{/if}

	<form method="POST" action="?/update" class="mt-8" use:enhance>
		<BlogEditor bind:title bind:description bind:content {errors} submitLabel="Spremi promjene" />
	</form>

	<section class="mt-12 rounded-2xl border border-red-200 bg-red-50/50 p-6">
		<h2 class="text-lg font-bold text-red-900">Opasna zona</h2>
		<p class="mt-2 text-sm text-red-800">Brisanje članka je trajno i ne može se poništiti.</p>
		<form
			method="POST"
			action="?/delete"
			class="mt-4"
			use:enhance={() => async ({ update }) => {
				if (!confirm('Obrisati ovaj članak?')) return;
				await update();
			}}
		>
			<button
				type="submit"
				class="rounded-xl border-2 border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50"
			>
				Obriši članak
			</button>
		</form>
	</section>
</div>
