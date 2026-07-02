<script lang="ts">
	let { data, children } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-12 md:px-8">
	<h1 class="text-3xl font-extrabold text-gray-900">Administracija</h1>

	<nav class="mt-6 flex gap-2 border-b border-gray-200">
		<a
			href="/admin"
			class="border-b-2 px-4 py-2 text-sm font-semibold transition {data.activeTab === 'users'
				? 'border-yellow-500 text-yellow-700'
				: 'border-transparent text-gray-600 hover:text-gray-900'}"
		>
			Korisnici
		</a>
		<a
			href="/admin/oglasi"
			class="border-b-2 px-4 py-2 text-sm font-semibold transition {data.activeTab === 'listings'
				? 'border-yellow-500 text-yellow-700'
				: 'border-transparent text-gray-600 hover:text-gray-900'}"
		>
			Oglasi
			{#if data.pendingCount > 0}
				<span
					class="ml-1.5 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white"
					>{data.pendingCount}</span
				>
			{/if}
		</a>
		<a
			href="/admin/tokeni"
			class="border-b-2 px-4 py-2 text-sm font-semibold transition {data.activeTab === 'tokens'
				? 'border-yellow-500 text-yellow-700'
				: 'border-transparent text-gray-600 hover:text-gray-900'}"
		>
			BP tokeni
		</a>
	</nav>

	<div class="mt-8">
		{@render children()}
	</div>
</div>
