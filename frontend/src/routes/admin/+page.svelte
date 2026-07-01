<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Administracija | BezProvizije.hr</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-12 md:px-8">
	<h1 class="text-3xl font-extrabold text-gray-900">Administracija</h1>
	<p class="mt-2 text-gray-600">Pregled registriranih korisnika.</p>

	{#if data.error}
		<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{data.error}</p>
	{/if}

	<div class="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-gray-200 text-sm">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-4 py-3 text-left font-semibold text-gray-700">Ime i prezime</th>
					<th class="px-4 py-3 text-left font-semibold text-gray-700">Telefon</th>
					<th class="px-4 py-3 text-left font-semibold text-gray-700">Uloga</th>
					<th class="px-4 py-3 text-left font-semibold text-gray-700">Registriran</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.users as user (user.id)}
					<tr>
						<td class="px-4 py-3 text-gray-900">{user.full_name}</td>
						<td class="px-4 py-3 text-gray-600">{user.phone}</td>
						<td class="px-4 py-3">
							<span
								class="rounded-full px-2.5 py-1 text-xs font-semibold {user.role === 'admin'
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-gray-100 text-gray-700'}"
							>
								{user.role === 'admin' ? 'Administrator' : 'Korisnik'}
							</span>
						</td>
						<td class="px-4 py-3 text-gray-500">
							{new Date(user.created_at).toLocaleDateString('hr-HR')}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="px-4 py-8 text-center text-gray-500">Nema korisnika.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
