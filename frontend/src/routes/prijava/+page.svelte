<script lang="ts">
	import { page } from '$app/stores';
	import GoogleLoginButton from '$lib/GoogleLoginButton.svelte';

	// Inicijalno stanje očitavamo iz URL-a.
	// Ako piše ?action=register, isLogin je false. U svim ostalim slučajevima (ili ako parametra nema), isLogin je true (Prijava).
	let isLogin = $state($page.url.searchParams.get('action') !== 'register');

	// Ovaj $effect osigurava da se forma prebaci ako korisnik klikne na link
	// dok se VEĆ nalazi na stranici za prijavu/registraciju.
	$effect(() => {
		const action = $page.url.searchParams.get('action');
		if (action === 'register') isLogin = false;
		if (action === 'login') isLogin = true;
	});

	// Varijable za formu
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (isLogin) {
			console.log('Prijava:', { email, password });
		} else {
			if (password !== confirmPassword) {
				alert('Lozinke se ne podudaraju!');
				return;
			}
			console.log('Registracija:', { email, password });
		}
	}
</script>

<!-- Glavni kontejner (centrira karticu na ekranu) -->
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
				<button
					onclick={() => (isLogin = false)}
					class="font-bold text-yellow-600 transition-colors hover:text-yellow-500"
				>
					Registrirajte se besplatno
				</button>
			{:else}
				Već imate račun?
				<button
					onclick={() => (isLogin = true)}
					class="font-bold text-yellow-600 transition-colors hover:text-yellow-500"
				>
					Prijavite se
				</button>
			{/if}
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div
			class="border border-gray-100 bg-white px-4 py-8 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10"
		>
			<form class="space-y-5" onsubmit={handleSubmit}>
				<!-- Email polje -->
				<div>
					<label for="email" class="block text-sm font-semibold text-gray-700">Email adresa</label>
					<div class="mt-1.5">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							bind:value={email}
							class="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
							placeholder="vas@email.com"
						/>
					</div>
				</div>

				<!-- Lozinka polje -->
				<div>
					<label for="password" class="block text-sm font-semibold text-gray-700">Lozinka</label>
					<div class="mt-1.5">
						<input
							id="password"
							name="password"
							type="password"
							autocomplete={isLogin ? 'current-password' : 'new-password'}
							required
							bind:value={password}
							class="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<!-- Potvrda lozinke (samo za registraciju) -->
				{#if !isLogin}
					<div>
						<label for="confirm-password" class="block text-sm font-semibold text-gray-700"
							>Potvrdite lozinku</label
						>
						<div class="mt-1.5">
							<input
								id="confirm-password"
								name="confirm-password"
								type="password"
								autocomplete="new-password"
								required
								bind:value={confirmPassword}
								class="block w-full appearance-none rounded-xl border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm transition-colors focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
								placeholder="••••••••"
							/>
						</div>
					</div>
				{/if}

				<!-- Zaboravljena lozinka (samo za prijavu) -->
				{#if isLogin}
					<div class="flex items-center justify-between">
						<div class="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
							/>
							<label for="remember-me" class="ml-2 block text-sm text-gray-700">Zapamti me</label>
						</div>

						<div class="text-sm">
							<a
								href="/zaboravljena-lozinka"
								class="font-bold text-yellow-600 hover:text-yellow-500">Zaboravili ste lozinku?</a
							>
						</div>
					</div>
				{/if}

				<!-- Glavni gumb za slanje -->
				<div class="pt-2">
					<button
						type="submit"
						class="flex w-full justify-center rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
					>
						{isLogin ? 'Prijavi se' : 'Završi registraciju'}
					</button>
				</div>
			</form>

			<!-- Divider -->
			<div class="mt-8">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-200"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-3 text-gray-500">Ili nastavite s</span>
					</div>
				</div>

				<!-- Google Login Gumb -->
				<GoogleLoginButton />
			</div>
		</div>
	</div>
</div>
