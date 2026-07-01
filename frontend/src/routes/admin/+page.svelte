<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Pagination from '$lib/Pagination.svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Korisnici | Administracija</title>
</svelte:head>

<p class="text-gray-600">
	Pregled registriranih korisnika.
	{#if data.pagination.total > 0}
		<span class="text-gray-500">({data.pagination.total} ukupno)</span>
	{/if}
</p>

{#if data.error}
	<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{data.error}</p>
{/if}

{#if form?.message}
	<p class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{form.message}</p>
{/if}

<div class="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
	<table class="min-w-full divide-y divide-gray-200 text-sm">
		<thead class="bg-gray-50">
			<tr>
				<th class="px-4 py-3 text-left font-semibold text-gray-700">Ime i prezime</th>
				<th class="px-4 py-3 text-left font-semibold text-gray-700">Telefon</th>
				<th class="px-4 py-3 text-left font-semibold text-gray-700">Uloga</th>
				<th class="px-4 py-3 text-left font-semibold text-gray-700">Registriran</th>
				<th class="px-4 py-3 text-left font-semibold text-gray-700">Akcije</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-100">
			{#each data.users as user (user.id)}
				<tr>
					<td class="px-4 py-3 text-gray-900">{user.full_name || '—'}</td>
					<td class="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
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
					<td class="px-4 py-3">
						{#if user.id === data.user.id}
							<span class="text-xs text-gray-400">Vi</span>
						{:else if user.role === 'admin'}
							<form
								method="POST"
								action="?/setRole"
								use:enhance={() => async ({ update }) => {
									await update();
									await invalidateAll();
								}}
							>
								<input type="hidden" name="id" value={user.id} />
								<input type="hidden" name="role" value="user" />
								<button
									type="submit"
									class="text-xs font-semibold text-red-700 hover:underline"
								>
									Ukloni admina
								</button>
							</form>
						{:else}
							<form
								method="POST"
								action="?/setRole"
								use:enhance={() => async ({ update }) => {
									await update();
									await invalidateAll();
								}}
							>
								<input type="hidden" name="id" value={user.id} />
								<input type="hidden" name="role" value="admin" />
								<button
									type="submit"
									class="text-xs font-semibold text-yellow-700 hover:underline"
								>
									Postavi za admina
								</button>
							</form>
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="5" class="px-4 py-8 text-center text-gray-500">Nema korisnika.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<Pagination
	currentPage={data.pagination.page}
	totalPages={data.pagination.totalPages}
	paramName="page"
/>
