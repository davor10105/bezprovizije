<script lang="ts">
	import { page } from '$app/state';

	let {
		currentPage,
		totalPages: total,
		paramName = 'page',
		class: className = ''
	}: {
		currentPage: number;
		totalPages: number;
		paramName?: string;
		class?: string;
	} = $props();

	function pageHref(p: number): string {
		const url = new URL(page.url);
		url.searchParams.set(paramName, String(p));
		return `${url.pathname}${url.search}`;
	}
</script>

{#if total > 1}
	<nav
		class="mt-6 flex items-center justify-center gap-4 {className}"
		aria-label="Stranice"
	>
		{#if currentPage > 1}
			<a
				href={pageHref(currentPage - 1)}
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
			>
				Prethodna
			</a>
		{:else}
			<span
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 opacity-50"
			>
				Prethodna
			</span>
		{/if}

		<span class="text-sm text-gray-600">Stranica {currentPage} od {total}</span>

		{#if currentPage < total}
			<a
				href={pageHref(currentPage + 1)}
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
			>
				Sljedeća
			</a>
		{:else}
			<span
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 opacity-50"
			>
				Sljedeća
			</span>
		{/if}
	</nav>
{/if}
