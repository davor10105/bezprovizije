<script lang="ts">
	import { enhance } from '$app/forms';
	import ImageUploadPreview from '$lib/ImageUploadPreview.svelte';
	import LocationPicker from '$lib/LocationPicker.svelte';
	import type { ListingType, PropertyType } from '$lib/types/property';
	import AttributeFieldGroups from '$lib/properties/AttributeFieldGroups.svelte';
	import PropertyTypeIcon from '$lib/properties/PropertyTypeIcon.svelte';
	import { getAttributeFieldsGrouped, isPropertyTypeAllowedForListing } from '$lib/properties/schema';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { isAdmin } from '$lib/auth';
	import { listingBpCost } from '$lib/tokens/queries';

	const STANDARD_SALE_BP = 70;
	const STANDARD_RENT_BP = 30;

	let { data, form } = $props();

	const formErrors = $derived((form?.errors ?? {}) as Record<string, string>);

	let step = $state(1);
	let loading = $state(false);

	let propertyType = $state<PropertyType | ''>('');
	let listingType = $state<ListingType | ''>('');
	let address = $state('');
	let lat = $state<number | null>(null);
	let lng = $state<number | null>(null);

	let stepErrors = $state<Record<string, string>>({});
	let imageFiles = $state<File[]>([]);

	const coreFields = $derived(
		propertyType ? data.coreOptionalFields[propertyType as PropertyType] : null
	);
	const attributeFieldGroups = $derived(
		propertyType ? getAttributeFieldsGrouped(propertyType as PropertyType, listingType) : []
	);

	const saleBpCost = $derived(listingBpCost(data.tokenSettings, 'sale'));
	const rentBpCost = $derived(listingBpCost(data.tokenSettings, 'rent'));
	const selectedBpCost = $derived(
		listingType === 'sale' ? saleBpCost : listingType === 'rent' ? rentBpCost : 0
	);
	const userIsAdmin = $derived(isAdmin(data.profile));
	const currentBalance = $derived(data.profile?.bp_balance ?? 0);
	const hasEnoughBp = $derived(userIsAdmin || currentBalance >= selectedBpCost);
	const buyBpHref = $derived(
		`/kupi-bp?redirect=${encodeURIComponent('/objavi-oglas')}&amount=${Math.max(selectedBpCost - currentBalance, 1)}`
	);

	function isListingTypeDisabled(value: string): boolean {
		return propertyType === 'room' && value === 'sale';
	}

	function standardBpCost(value: string): number {
		return value === 'sale' ? STANDARD_SALE_BP : STANDARD_RENT_BP;
	}

	const availablePropertyTypes = $derived(
		Object.entries(data.propertyTypeConfig).filter(([value]) =>
			isPropertyTypeAllowedForListing(value as PropertyType, listingType)
		)
	);

	$effect(() => {
		if (propertyType === 'room' && listingType === 'sale') {
			listingType = 'rent';
		}
		if (listingType === 'sale' && propertyType === 'room') {
			propertyType = '';
		}
	});

	function validateStep1(): boolean {
		const errors: Record<string, string> = {};
		if (!propertyType) errors.property_type = 'Odaberite vrstu nekretnine.';
		if (!listingType) errors.listing_type = 'Odaberite prodaju ili najam.';
		if (!userIsAdmin && listingType && currentBalance < selectedBpCost) {
			errors.tokens = `Potrebno je ${selectedBpCost} BP za objavu ovog oglasa.`;
		}
		stepErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function validateStep2(): boolean {
		const errors: Record<string, string> = {};
		if (!address.trim()) errors.address = 'Unesite ili odaberite adresu.';
		if (lat === null || lng === null) errors.location = 'Označite lokaciju na karti.';
		stepErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function validateStep3(): boolean {
		const errors: Record<string, string> = {};
		if (imageFiles.length === 0) {
			errors.images = 'Dodajte barem jednu fotografiju.';
		}
		stepErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function nextStep() {
		if (step === 1 && !validateStep1()) return;
		if (step === 2 && !validateStep2()) return;
		stepErrors = {};
		step = Math.min(step + 1, 3);
	}

	function prevStep() {
		stepErrors = {};
		step = Math.max(step - 1, 1);
	}

	const handleSubmit: SubmitFunction = ({ formData }) => {
		loading = true;
		formData.delete('images');
		for (const file of imageFiles) {
			formData.append('images', file);
		}
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};

	const stepLabels = ['Vrsta oglasa', 'Lokacija', 'Detalji'];
</script>

<svelte:head>
	<title>Objavi oglas | BezProvizije.hr</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 md:px-8">
	<h1 class="text-3xl font-extrabold text-gray-900">
		Objavite <span class="text-yellow-500">oglas</span>
	</h1>
	<p class="mt-2 text-sm text-gray-600">
		Korak {step} od 3 — {stepLabels[step - 1]}
	</p>

	<div class="mt-6 flex gap-2">
		{#each stepLabels as label, i}
			<div
				class="h-1.5 flex-1 rounded-full {i + 1 <= step ? 'bg-yellow-500' : 'bg-gray-200'}"
				title={label}
			></div>
		{/each}
	</div>

	{#if formErrors.form}
		<div class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
			{formErrors.form}
		</div>
	{/if}

	<form
		class="mt-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50 md:p-8"
		method="POST"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
	>
		{#if step !== 2 && address}
			<input type="hidden" name="address" value={address} />
		{/if}
		{#if step !== 2 && lat !== null && lng !== null}
			<input type="hidden" name="lat" value={lat} />
			<input type="hidden" name="lng" value={lng} />
		{/if}

		<!-- Step 1 -->
		<div class:hidden={step !== 1} class="space-y-6">
			<div>
				<span class="block text-sm font-semibold text-gray-700">Vrsta transakcije</span>
				<div class="mt-3 grid grid-cols-2 gap-4">
					{#each Object.entries(data.listingTypeLabels) as [value, label]}
						{@const cost = value === 'sale' ? saleBpCost : rentBpCost}
						{@const standardCost = standardBpCost(value)}
						{@const selected = listingType === value}
						{@const disabled = isListingTypeDisabled(value)}
						<label
							class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 px-4 py-6 text-center transition {disabled
								? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
								: selected
									? 'cursor-pointer border-yellow-500 bg-yellow-50 shadow-md'
									: 'cursor-pointer border-gray-200 hover:border-gray-300'}"
						>
							<input
								type="radio"
								name="listing_type"
								value={value}
								bind:group={listingType}
								disabled={disabled}
								class="sr-only"
							/>
							<span
								class="text-lg font-bold {disabled
									? 'text-gray-400'
									: selected
										? 'text-yellow-900'
										: 'text-gray-900'}"
							>
								{label}
							</span>
							{#if disabled}
								<span class="text-xs text-gray-400">Nije dostupno za sobe</span>
							{:else if userIsAdmin}
								<span
									class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold tracking-wide text-green-800 uppercase"
								>
									Besplatno
								</span>
							{:else}
								<div class="flex flex-col items-center gap-1.5">
									<span class="flex items-baseline gap-1 text-gray-500">
										<span
											class="text-xl font-extrabold line-through decoration-yellow-500 decoration-4 underline-offset-2"
											>{standardCost}</span
										>
										<span
											class="text-sm font-bold line-through decoration-yellow-500 decoration-4 underline-offset-2"
											>BP</span
										>
									</span>
									<span class="text-sm font-bold tracking-wide text-yellow-600 uppercase"
										>Promotivna cijena:</span
									>
									{#if cost === 0}
										<span
											class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold tracking-wide text-green-800 uppercase"
										>
											Besplatno
										</span>
									{:else}
										<span
											class="flex items-baseline gap-1 rounded-full bg-white px-4 py-1.5 shadow-sm ring-1 ring-yellow-200"
										>
											<span class="text-2xl font-extrabold text-gray-900">{cost}</span>
											<span class="text-sm font-bold text-yellow-700">BP</span>
										</span>
									{/if}
								</div>
							{/if}
						</label>
					{/each}
				</div>
				{#if stepErrors.listing_type || formErrors.listing_type}
					<p class="mt-1 text-sm text-red-600">
						{stepErrors.listing_type || formErrors.listing_type}
					</p>
				{/if}

				<p
					class="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-800"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mt-0.5 h-4 w-4 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>Vaš oglas ostaje online sve do prodaje ili najma nekretnine.</span>
				</p>
			</div>

			{#if !userIsAdmin}
				<div class="rounded-2xl border border-yellow-200 bg-linear-to-br from-yellow-50 to-amber-50 p-5 shadow-sm">
					<p class="text-xs text-yellow-800">
						Vaše stanje: <span class="font-bold">{currentBalance} BP</span>
					</p>

					{#if listingType && !hasEnoughBp}
						<div class="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
							Nedostaje vam {selectedBpCost - currentBalance} BP za objavu odabranog oglasa.
						</div>
						<a
							href={buyBpHref}
							class="mt-3 flex w-full items-center justify-center rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white transition-colors hover:bg-yellow-600"
						>
							Dodaj BP tokene
						</a>
					{/if}
				</div>
			{/if}

			<div>
				<span class="block text-sm font-semibold text-gray-700">Vrsta nekretnine</span>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					{#each availablePropertyTypes as [value, config]}
						<label
							class="flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition {propertyType ===
							value
								? 'border-yellow-500 bg-yellow-50'
								: 'border-gray-200 hover:border-gray-300'}"
						>
							<input
								type="radio"
								name="property_type"
								value={value}
								bind:group={propertyType}
								class="sr-only"
							/>
							<PropertyTypeIcon
								type={value as PropertyType}
								class="h-9 w-9 {propertyType === value
									? 'text-yellow-600'
									: 'text-yellow-500/70'}"
							/>
							<span>
								<span class="block font-semibold text-gray-900">{config.label}</span>
								<span class="block text-xs text-gray-500">{config.description}</span>
							</span>
						</label>
					{/each}
				</div>
				{#if stepErrors.property_type || formErrors.property_type}
					<p class="mt-1 text-sm text-red-600">
						{stepErrors.property_type || formErrors.property_type}
					</p>
				{/if}
			</div>
		</div>

		<!-- Step 2 -->
		{#if step === 2}
			<div class="space-y-4">
				<LocationPicker
					bind:address
					bind:lat
					bind:lng
					error={stepErrors.location || stepErrors.address || formErrors.location || formErrors.address}
				/>
			</div>
		{/if}

		<!-- Step 3 -->
		<div class:hidden={step !== 3} class="space-y-5">
			<div>
				<label for="title" class="block text-sm font-semibold text-gray-700">Naslov oglasa</label>
				<input
					id="title"
					name="title"
					type="text"
					required
					minlength="5"
					placeholder="npr. Prostran trosoban stan s terasom"
					class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
				/>
				{#if formErrors.title}
					<p class="mt-1 text-sm text-red-600">{formErrors.title}</p>
				{/if}
			</div>

			<div>
				<label for="description" class="block text-sm font-semibold text-gray-700">Opis</label>
				<textarea
					id="description"
					name="description"
					required
					minlength="20"
					rows="5"
					placeholder="Opišite nekretninu, stanje, pogodnosti i okolicu..."
					class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
				></textarea>
				{#if formErrors.description}
					<p class="mt-1 text-sm text-red-600">{formErrors.description}</p>
				{/if}
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="price" class="block text-sm font-semibold text-gray-700">
						Cijena (€) {listingType === 'rent' ? '/ mj.' : ''}
					</label>
					<input
						id="price"
						name="price"
						type="number"
						min="1"
						step="1"
						required
						class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
					/>
					{#if formErrors.price}
						<p class="mt-1 text-sm text-red-600">{formErrors.price}</p>
					{/if}
				</div>
				<div>
					<label for="sqm" class="block text-sm font-semibold text-gray-700">Površina (m²)</label>
					<input
						id="sqm"
						name="sqm"
						type="number"
						min="1"
						step="0.1"
						required
						class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
					/>
					{#if formErrors.sqm}
						<p class="mt-1 text-sm text-red-600">{formErrors.sqm}</p>
					{/if}
				</div>
			</div>

			{#if coreFields}
				<div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
					<h3 class="text-sm font-semibold text-gray-800">Osnovne značajke (opcionalno)</h3>
					<div class="mt-3 grid gap-4 sm:grid-cols-2">
						{#if coreFields.rooms}
							<div>
								<label for="rooms" class="block text-sm font-medium text-gray-700"
									>Broj soba</label
								>
								<input
									id="rooms"
									name="rooms"
									type="number"
									min="0"
									class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
								/>
							</div>
						{/if}
						{#if coreFields.bathrooms}
							<div>
								<label for="bathrooms" class="block text-sm font-medium text-gray-700"
									>Broj kupaonica</label
								>
								<input
									id="bathrooms"
									name="bathrooms"
									type="number"
									min="0"
									class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
								/>
							</div>
						{/if}
						{#if coreFields.build_year}
							<div>
								<label for="build_year" class="block text-sm font-medium text-gray-700"
									>Godina gradnje</label
								>
								<input
									id="build_year"
									name="build_year"
									type="number"
									min="1800"
									max="2100"
									class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
								/>
							</div>
						{/if}
						{#if coreFields.parking_spaces}
							<div>
								<label for="parking_spaces" class="block text-sm font-medium text-gray-700"
									>Parkirna mjesta</label
								>
								<input
									id="parking_spaces"
									name="parking_spaces"
									type="number"
									min="0"
									class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
								/>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			{#if attributeFieldGroups.length > 0}
				<div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
					<h3 class="text-sm font-semibold text-gray-800">Dodatne značajke (opcionalno)</h3>
					<div class="mt-3">
						<AttributeFieldGroups mode="form" groups={attributeFieldGroups} errors={formErrors} />
					</div>
				</div>
			{/if}

			<ImageUploadPreview
				bind:files={imageFiles}
				error={stepErrors.images || formErrors.images}
			/>
		</div>

		<div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
			{#if step > 1}
				<button
					type="button"
					onclick={prevStep}
					class="rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
				>
					Nazad
				</button>
			{:else}
				<div></div>
			{/if}

			{#if step < 3}
				<button
					type="button"
					onclick={nextStep}
					class="rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-gray-800"
				>
					Nastavi
				</button>
			{:else}
				<button
					type="submit"
					disabled={loading}
					onclick={(e) => {
						if (!validateStep3()) {
							e.preventDefault();
						}
					}}
					class="rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-gray-800 disabled:opacity-60"
				>
					{loading ? 'Objavljujem...' : 'Objavi oglas'}
				</button>
			{/if}
		</div>
	</form>
</div>
