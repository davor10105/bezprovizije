<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import GoogleLoginButton from '$lib/GoogleLoginButton.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();

	const formErrors = $derived((form?.errors ?? {}) as Record<string, string>);

	let isLogin = $state($page.url.searchParams.get('action') !== 'register');
	let loading = $state(false);

	$effect(() => {
		const action = $page.url.searchParams.get('action');
		if (action === 'register') isLogin = false;
		if (action === 'login') isLogin = true;
	});

	$effect(() => {
		if (form?.action === 'login') isLogin = true;
		if (form?.action === 'register') isLogin = false;
	});

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};
</script>

<div class="flex min-h-[80vh] flex-col justify-center bg-gray-50/50 py-12 sm:px-6 lg:px-8">
	<div class="text-center sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
			{#if isLogin}
				Dobrodošli <span class="text-yellow-500">natrag.</span>
			{:else}
				Kreirajte <span class="text-yellow-500">račun.</span>
			{/if}
		</h2>
		<p class="mt-2 text-sm text-gray-600">
			{#if isLogin}
				Nemate račun?
				<a
					href="/prijava?action=register"
					class="font-bold text-yellow-600 transition-colors hover:text-yellow-500"
				>
					Registrirajte se besplatno
				</a>
			{:else}
				Već imate račun?
				<a
					href="/prijava?action=login"
					class="font-bold text-yellow-600 transition-colors hover:text-yellow-500"
				>
					Prijavite se
				</a>
			{/if}
		</p>
		{#if !isLogin}
			<p class="mt-1 text-xs text-gray-500">
				Ime, prezime i telefon unijet ćete nakon potvrde emaila.
			</p>
		{/if}
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div
			class="border border-gray-100 bg-white px-4 py-8 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10"
		>
			{#if form?.success}
				<div class="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
					{form.message}
				</div>
			{/if}

			{#if formErrors.form}
				<div class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
					{formErrors.form}
				</div>
			{/if}

			<form
				class="space-y-5"
				method="POST"
				action={isLogin ? '?/login' : '?/register'}
				use:enhance={handleSubmit}
			>
				<div>
					<label for="email" class="block text-sm font-semibold text-gray-700">Email adresa</label>
					<div class="mt-1.5">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							value={form?.email ?? ''}
							class="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
							placeholder="vas@email.com"
						/>
					</div>
					{#if formErrors.email}
						<p class="mt-1 text-sm text-red-600">{formErrors.email}</p>
					{/if}
				</div>

				<div>
					<label for="password" class="block text-sm font-semibold text-gray-700">Lozinka</label>
					<div class="mt-1.5">
						<input
							id="password"
							name="password"
							type="password"
							autocomplete={isLogin ? 'current-password' : 'new-password'}
							required
							class="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
							placeholder="••••••••"
						/>
					</div>
					{#if formErrors.password}
						<p class="mt-1 text-sm text-red-600">{formErrors.password}</p>
					{/if}
				</div>

				{#if !isLogin}
					<div>
						<label for="confirmPassword" class="block text-sm font-semibold text-gray-700"
							>Potvrdite lozinku</label
						>
						<div class="mt-1.5">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autocomplete="new-password"
								required
								class="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
								placeholder="••••••••"
							/>
						</div>
						{#if formErrors.confirmPassword}
							<p class="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
						{/if}
					</div>
				{/if}

				<div class="pt-2">
					<button
						type="submit"
						disabled={loading}
						class="flex w-full justify-center rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
					>
						{loading ? 'Učitavanje...' : isLogin ? 'Prijavi se' : 'Završi registraciju'}
					</button>
				</div>
			</form>

			<div class="mt-8">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-200"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-3 text-gray-500">Ili nastavite s</span>
					</div>
				</div>

				<GoogleLoginButton supabase={data.supabase} />
			</div>
		</div>
	</div>
</div>
