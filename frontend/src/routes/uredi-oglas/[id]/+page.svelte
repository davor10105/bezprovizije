<script lang="ts">
	import { enhance } from '$app/forms';
	import LocationPicker from '$lib/LocationPicker.svelte';
	import PropertyImageManager from '$lib/PropertyImageManager.svelte';
	import type { ListingType, PropertyType, ApprovalStatus } from '$lib/types/property';
	import type { AttributeField } from '$lib/properties/schema';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data, form } = $props();

	const formErrors = $derived((form?.errors ?? {}) as Record<string, string>);

	let loading = $state(false);
	let deleteConfirm = $state(false);

	let propertyType = $state<PropertyType>(data.property.property_type);
	let listingType = $state<ListingType>(data.property.listing_type);
	let address = $state(data.property.address);
	let lat = $state<number | null>(data.property.lat);
	let lng = $state<number | null>(data.property.lng);

	let newImageFiles = $state<File[]>([]);
	let existingImages = $state(data.images);
	let removedImageIds = $state<string[]>([]);

	const coreFields = $derived(data.coreOptionalFields[propertyType]);
	const attributeFields = $derived(data.attributeFieldsByType[propertyType]);

	const statusLabels: Record<ApprovalStatus, string> = {
		pending: 'Na čekanju',
		approved: 'Odobren',
		rejected: 'Odbijen'
	};

	const statusClasses: Record<ApprovalStatus, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		approved: 'bg-green-100 text-green-800',
		rejected: 'bg-red-100 text-red-800'
	};

	const approvalStatus = $derived(data.property.approval_status as ApprovalStatus);

	const handleSubmit: SubmitFunction = ({ formData }) => {
		loading = true;
		formData.delete('images');
		for (const file of newImageFiles) {
			formData.append('images', file);
		}
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};

	const handleDelete: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};
</script>

<svelte:head>
	<title>Uredi oglas | BezProvizije.hr</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10 md:px-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-3xl font-extrabold text-gray-900">
				Uredi <span class="text-yellow-500">oglas</span>
			</h1>
			<p class="mt-2 text-sm text-gray-600">Ažurirajte podatke o nekretnini.</p>
		</div>
		<span
			class="rounded-full px-3 py-1 text-xs font-semibold {statusClasses[approvalStatus]}"
		>
			{statusLabels[approvalStatus]}
		</span>
	</div>

	{#if !data.isAdmin}
		<p class="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
			Nakon spremanja promjena oglas će ponovno biti poslan na odobrenje administratora.
		</p>
	{/if}

	{#if formErrors.form}
		<div class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
			{formErrors.form}
		</div>
	{/if}

	<form
		class="mt-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50 md:p-8"
		method="POST"
		action="?/update"
		enctype="multipart/form-data"
		use:enhance={handleSubmit}
	>
		<div>
			<span class="block text-sm font-semibold text-gray-700">Vrsta transakcije</span>
			<div class="mt-3 grid grid-cols-2 gap-3">
				{#each Object.entries(data.listingTypeLabels) as [value, label]}
					<label
						class="flex cursor-pointer items-center justify-center rounded-xl border-2 px-4 py-4 text-center text-sm font-semibold transition {listingType ===
						value
							? 'border-yellow-500 bg-yellow-50 text-yellow-900'
							: 'border-gray-200 text-gray-700 hover:border-gray-300'}"
					>
						<input
							type="radio"
							name="listing_type"
							value={value}
							bind:group={listingType}
							class="sr-only"
						/>
						{label}
					</label>
				{/each}
			</div>
			{#if formErrors.listing_type}
				<p class="mt-1 text-sm text-red-600">{formErrors.listing_type}</p>
			{/if}
		</div>

		<div>
			<span class="block text-sm font-semibold text-gray-700">Vrsta nekretnine</span>
			<div class="mt-3 grid gap-3 sm:grid-cols-2">
				{#each Object.entries(data.propertyTypeConfig) as [value, config]}
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
						<span class="text-2xl">{config.icon}</span>
						<span>
							<span class="block font-semibold text-gray-900">{config.label}</span>
							<span class="block text-xs text-gray-500">{config.description}</span>
						</span>
					</label>
				{/each}
			</div>
			{#if formErrors.property_type}
				<p class="mt-1 text-sm text-red-600">{formErrors.property_type}</p>
			{/if}
		</div>

		<LocationPicker
			bind:address
			bind:lat
			bind:lng
			error={formErrors.location || formErrors.address}
		/>

		<div>
			<label for="title" class="block text-sm font-semibold text-gray-700">Naslov oglasa</label>
			<input
				id="title"
				name="title"
				type="text"
				required
				minlength="5"
				value={data.property.title}
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
				class="mt-1.5 block w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none sm:text-sm"
				>{data.property.description}</textarea
			>
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
					value={data.property.price}
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
					value={data.property.sqm}
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
							<label for="rooms" class="block text-sm font-medium text-gray-700">Broj soba</label>
							<input
								id="rooms"
								name="rooms"
								type="number"
								min="0"
								value={data.property.rooms ?? ''}
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
								value={data.property.bathrooms ?? ''}
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
								value={data.property.build_year ?? ''}
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
								value={data.property.parking_spaces ?? ''}
								class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if attributeFields.length > 0}
			<div class="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
				<h3 class="text-sm font-semibold text-gray-800">Dodatne značajke (opcionalno)</h3>
				<div class="mt-3 grid gap-4 sm:grid-cols-2">
					{#each attributeFields as field (field.key)}
						{@const f = field as AttributeField}
						{@const attrValue = data.property.attributes[f.key]}
						<div class={f.type === 'boolean' ? 'flex items-center gap-2 sm:col-span-2' : ''}>
							{#if f.type === 'boolean'}
								<input
									id={`attr_${f.key}`}
									name={`attr_${f.key}`}
									type="checkbox"
									value="true"
									checked={attrValue === true}
									class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
								/>
								<label for={`attr_${f.key}`} class="text-sm font-medium text-gray-700"
									>{f.label}</label
								>
							{:else if f.type === 'select'}
								<label for={`attr_${f.key}`} class="block text-sm font-medium text-gray-700"
									>{f.label}</label
								>
								<select
									id={`attr_${f.key}`}
									name={`attr_${f.key}`}
									class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">— Odaberi —</option>
									{#each f.options ?? [] as option}
										<option value={option} selected={attrValue === option}>{option}</option>
									{/each}
								</select>
							{:else}
								<label for={`attr_${f.key}`} class="block text-sm font-medium text-gray-700"
									>{f.label}</label
								>
								<input
									id={`attr_${f.key}`}
									name={`attr_${f.key}`}
									type={f.type === 'number' ? 'number' : 'text'}
									min={f.min}
									max={f.max}
									placeholder={f.placeholder}
									value={attrValue ?? ''}
									class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
								/>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<PropertyImageManager
			bind:files={newImageFiles}
			bind:existingImages
			bind:removedImageIds
			error={formErrors.images}
		/>

		<div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
			<a
				href="/account"
				class="rounded-xl border-2 border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
			>
				Odustani
			</a>
			<button
				type="submit"
				disabled={loading}
				class="rounded-xl bg-linear-to-r from-gray-900 to-gray-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-gray-800 disabled:opacity-60"
			>
				{loading ? 'Spremam...' : 'Spremi promjene'}
			</button>
		</div>
	</form>

	<div class="mt-8 rounded-2xl border border-red-100 bg-red-50/50 p-6">
		<h2 class="text-sm font-semibold text-red-800">Opasna zona</h2>
		<p class="mt-1 text-sm text-red-700">
			Brisanje oglasa je trajno i ne može se poništiti.
		</p>
		{#if !deleteConfirm}
			<button
				type="button"
				class="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
				onclick={() => (deleteConfirm = true)}
			>
				Obriši oglas
			</button>
		{:else}
			<form method="POST" action="?/delete" use:enhance={handleDelete} class="mt-4 flex flex-wrap gap-3">
				<button
					type="submit"
					disabled={loading}
					class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
				>
					Potvrdi brisanje
				</button>
				<button
					type="button"
					class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
					onclick={() => (deleteConfirm = false)}
				>
					Odustani
				</button>
			</form>
		{/if}
	</div>
</div>
