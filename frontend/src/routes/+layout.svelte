<script lang="ts">
	import './layout.css';
	import { invalidate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.png';
	import logo from '$lib/assets/bezprovizije_logo.png';
	import logoLight from '$lib/assets/bezprovizije_logo_light.png';
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	let mobileMenu = $state(false);
	let { data, children } = $props();
	let { supabase, claims, profile } = $derived(data);
	let isLoggedIn = $derived(!!claims);

	// Funkcija koja zatvara izbornik nakon klika
	function closeMenu() {
		mobileMenu = false;
	}

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== claims?.exp) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<main class="relative z-0 flex-grow overflow-y-auto">
		<header class="sticky top-0 z-10000 flex-shrink-0 bg-secondary/70 backdrop-blur">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
				<a href="/" class="flex-shrink-0">
					<img src={logo} alt="BezProvizije.hr" class="h-12 w-auto md:h-20" />
				</a>
				<nav class="hidden space-x-6 text-sm md:flex lg:text-base">
					<a
						href="/"
						class={page.url.pathname === '/'
							? 'font-bold text-yellow-500'
							: 'text-gray-600 transition-colors hover:text-yellow-500'}
					>
						Početna
					</a>
					<a
						href="/pretraga"
						class={page.url.pathname === '/pretraga'
							? 'font-bold text-yellow-500'
							: 'text-gray-600 transition-colors hover:text-yellow-500'}
					>
						Pretraga nekretnina
					</a>
					<a
						href="/karta"
						class={page.url.pathname === '/karta'
							? 'font-bold text-yellow-500'
							: 'text-gray-600 transition-colors hover:text-yellow-500'}
					>
						Karta
					</a>
					<a
						href="/blog"
						class={page.url.pathname === '/blog'
							? 'font-bold text-yellow-500'
							: 'text-gray-600 transition-colors hover:text-yellow-500'}
					>
						Blog
					</a>
					<a
						href="/objavi-oglas"
						class={page.url.pathname === '/objavi-oglas'
							? 'font-extrabold text-yellow-500'
							: 'font-bold text-gray-600 underline transition-colors hover:text-yellow-500'}
					>
						Objavite oglas
					</a>
				</nav>

				<div class="hidden items-center space-x-3 md:flex">
					{#if isLoggedIn}
						<a
							href="/account"
							class="font-medium text-gray-600 transition-colors hover:text-gray-900"
						>
							{profile?.full_name || 'Moj račun'}
						</a>
						{#if profile?.role === 'admin'}
							<a
							href="/admin/oglasi"
							class="font-medium text-yellow-600 transition-colors hover:text-yellow-500"
						>
							Admin
							</a>
						{/if}
					{:else}
						<a
							href="/prijava?action=login"
							class="font-medium text-gray-600 transition-colors hover:text-gray-900"
						>
							Prijava
						</a>
						<a
							href="/prijava?action=register"
							class="rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-gray-800"
						>
							Registracija
						</a>
					{/if}
				</div>

				<!-- Mobile Menu Gumb -->
				<button
					class="p-2 text-gray-900 focus:outline-none md:hidden"
					onclick={() => (mobileMenu = !mobileMenu)}
					aria-label="Togglaj izbornik"
				>
					{#if mobileMenu}
						<!-- X Ikona (Zatvori) -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<!-- Hamburger Ikona -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-7 w-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					{/if}
				</button>
			</div>

			<!-- Mobile Padajući Izbornik -->
			{#if mobileMenu}
				<div
					transition:slide={{ duration: 300 }}
					class="absolute top-full left-0 w-full border-b border-gray-100 bg-white shadow-xl backdrop-blur-xl md:hidden"
				>
					<div class="flex flex-col space-y-4 px-6 py-6">
						<a
							href="/"
							onclick={closeMenu}
							class="flex items-center gap-3 text-lg {page.url.pathname === '/'
								? 'font-bold text-yellow-500'
								: 'font-medium text-gray-700'}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0 {page.url.pathname === '/'
									? 'text-yellow-500'
									: 'text-gray-400'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
							Početna
						</a>

						<a
							href="/pretraga"
							onclick={closeMenu}
							class="flex items-center gap-3 text-lg {page.url.pathname === '/pretraga'
								? 'font-bold text-yellow-500'
								: 'font-medium text-gray-700'}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0 {page.url.pathname === '/pretraga'
									? 'text-yellow-500'
									: 'text-gray-400'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
							Pretraga nekretnina
						</a>

						<a
							href="/karta"
							onclick={closeMenu}
							class="flex items-center gap-3 text-lg {page.url.pathname === '/karta'
								? 'font-bold text-yellow-500'
								: 'font-medium text-gray-700'}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0 {page.url.pathname === '/karta'
									? 'text-yellow-500'
									: 'text-gray-400'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
								/>
							</svg>
							Karta
						</a>

						<a
							href="/blog"
							onclick={closeMenu}
							class="flex items-center gap-3 text-lg {page.url.pathname === '/blog'
								? 'font-bold text-yellow-500'
								: 'font-medium text-gray-700'}"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 shrink-0 {page.url.pathname === '/blog'
									? 'text-yellow-500'
									: 'text-gray-400'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							Blog
						</a>

						<hr class="my-2 border-gray-200" />

						<div class="flex flex-col gap-3 pt-2">
							{#if isLoggedIn}
								<a
									href="/account"
									onclick={closeMenu}
									class="flex w-full justify-center rounded-xl border-2 border-gray-200 py-3 text-lg font-semibold text-gray-700 transition hover:bg-gray-50"
								>
									{profile?.full_name || 'Moj račun'}
								</a>
								{#if profile?.role === 'admin'}
									<a
										href="/admin/oglasi"
										onclick={closeMenu}
										class="flex w-full justify-center rounded-xl border-2 border-yellow-200 py-3 text-lg font-semibold text-yellow-700 transition hover:bg-yellow-50"
									>
										Administracija
									</a>
								{/if}
							{:else}
								<a
									href="/prijava?action=login"
									onclick={closeMenu}
									class="flex w-full justify-center rounded-xl border-2 border-gray-200 py-3 text-lg font-semibold text-gray-700 transition hover:bg-gray-50"
									>Prijava</a
								>
								<a
									href="/prijava?action=register"
									onclick={closeMenu}
									class="flex w-full justify-center rounded-xl bg-linear-to-r from-gray-900 to-gray-600 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-gray-800"
									>Registracija</a
								>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</header>
		{@render children()}
		<footer class="bg-gray-900 px-4 py-12 text-gray-300 md:px-8">
			<div class="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 md:grid-cols-4">
				<div>
					<img src={logoLight} alt="BezProvizije Logo" class="inline h-16 w-auto" />
					<p class="text-sm">Platforma za izravnu kupnju i prodaju nekretnina.</p>
				</div>

				<div>
					<h4 class="mb-3 font-semibold text-white">Navigacija</h4>
					<ul class="space-y-2 text-sm">
						<li>Početna</li>
						<li>Pretraga nekretnina</li>
						<li>Blog</li>
						<li><a href="/uvjeti">Uvjeti korištenja</a></li>
					</ul>
				</div>

				<div>
					<h4 class="mb-3 font-semibold text-white">Kontakt</h4>
					<ul class="space-y-2 text-sm">
						<li>Email: info@BezProvizije.hr</li>
						<li>Telefon: +385 123 456</li>
					</ul>
				</div>
			</div>

			<div class="mt-10 text-center text-xs text-gray-500">
				© 2026 BezProvizije.hr Sva prava pridržana.
			</div>
		</footer>
	</main>

	<!-- Footer -->
</div>
