<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();

	const formErrors = $derived((form?.errors ?? {}) as Record<string, string>);

	let loading = $state(false);

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result, update }) => {
			loading = false;
			await update();
			if (result.type === 'success') {
				await invalidateAll();
			}
		};
	};

	const handleSignOut: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};
</script>

<svelte:head>
	<title>{data.needsSetup ? 'Postavljanje računa' : 'Moj račun'} | BezProvizije.hr</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-12 md:px-8">
	{#if data.needsSetup}
		<h1 class="text-3xl font-extrabold text-gray-900">
			Dovršite <span class="text-yellow-500">postavljanje računa</span>
		</h1>
		<p class="mt-2 text-sm text-gray-600">
			Još jedan korak — unesite kontakt podatke koji će se prikazivati na vašim oglasima za
			nekretnine.
		</p>
	{:else}
		<h1 class="text-3xl font-extrabold text-gray-900">Moj <span class="text-yellow-500">račun</span></h1>
		<p class="mt-2 text-sm text-gray-600">
			Ovi podaci prikazuju se kao kontakt na vašim oglasima za nekretnine.
		</p>
	{/if}

	{#if data.profile?.role === 'admin'}
		<div class="mt-4">
			<a
				href="/admin"
				class="inline-flex items-center rounded-lg bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-200"
			>
				Administracija
			</a>
		</div>
	{/if}

	{#if form?.success}
		<div class="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
			{data.needsSetup
				? 'Profil je spremljen. Sada možete koristiti platformu.'
				: 'Podaci su uspješno spremljeni.'}
		</div>
	{/if}

	{#if formErrors.form}
		<div class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
			{formErrors.form}
		</div>
	{/if}

	<form
		class="mt-8 space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50"
		method="post"
		action="?/update"
		use:enhance={handleSubmit}
	>
		<div>
			<label for="email" class="block text-sm font-semibold text-gray-700">Email adresa</label>
			<input
				id="email"
				type="email"
				value={data.email ?? ''}
				disabled
				class="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 sm:text-sm"
			/>
		</div>

		<div>
			<label for="fullName" class="block text-sm font-semibold text-gray-700">Ime i prezime</label>
			<input
				id="fullName"
				name="fullName"
				type="text"
				autocomplete="name"
				required
				value={form?.fullName ?? data.profile?.full_name ?? ''}
				class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
				placeholder="Ivan Horvat"
			/>
			{#if formErrors.fullName}
				<p class="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
			{/if}
		</div>

		<div>
			<label for="phone" class="block text-sm font-semibold text-gray-700">Broj telefona</label>
			<input
				id="phone"
				name="phone"
				type="tel"
				autocomplete="tel"
				required
				value={form?.phone ?? data.profile?.phone ?? ''}
				class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
				placeholder="+385 91 234 5678"
			/>
			{#if formErrors.phone}
				<p class="mt-1 text-sm text-red-600">{formErrors.phone}</p>
			{/if}
		</div>

		{#if !data.needsSetup}
			<div>
				<span class="block text-sm font-semibold text-gray-700">Uloga</span>
				<p class="mt-1.5 text-sm text-gray-600">
					{data.profile?.role === 'admin' ? 'Administrator' : 'Korisnik'}
				</p>
			</div>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-gray-800 disabled:opacity-60"
		>
			{loading ? 'Spremanje...' : data.needsSetup ? 'Spremi i nastavi' : 'Spremi promjene'}
		</button>
	</form>

	{#if !data.needsSetup}
		<form method="post" action="?/signout" use:enhance={handleSignOut} class="mt-6">
			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
			>
				Odjava
			</button>
		</form>
	{/if}
</div>
