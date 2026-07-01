<script lang="ts">
	import { enhance } from '$app/forms';
	import BlogEditor from '$lib/BlogEditor.svelte';

	let { form } = $props();

	let title = $state('');
	let description = $state('');
	let content = $state('');

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
	<title>Novi članak | Blog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-12 md:px-8">
	<a href="/blog" class="text-sm font-semibold text-yellow-600 hover:text-yellow-800">
		← Natrag na blog
	</a>

	<h1 class="mt-4 text-3xl font-extrabold text-gray-900">Novi članak</h1>
	<p class="mt-2 text-gray-600">Kreirajte novi blog članak s tekstom, slikama i poveznicama.</p>

	{#if errors.form}
		<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p>
	{/if}

	<form method="POST" class="mt-8" use:enhance>
		<BlogEditor bind:title bind:description bind:content {errors} submitLabel="Objavi članak" />
	</form>
</div>
