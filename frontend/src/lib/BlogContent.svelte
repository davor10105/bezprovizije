<script lang="ts">
	import { renderMarkdown } from '$lib/blog/markdown';

	let { content }: { content: string } = $props();

	const html = $derived(renderMarkdown(content));
</script>

<article class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-yellow-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
	{@html html}
</article>
