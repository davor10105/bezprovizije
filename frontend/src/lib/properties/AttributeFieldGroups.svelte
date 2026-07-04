<script lang="ts">
	import type { AttributeFieldGroup } from '$lib/properties/schema';
	import { countActiveFiltersInGroup } from '$lib/properties/schema';

	type Props = {
		mode: 'form' | 'search';
		groups: AttributeFieldGroup[];
		/** Existing attribute values when editing a listing (form mode). */
		values?: Record<string, string | number | boolean>;
		/** Active search filter values (search mode). */
		filterAttributes?: Record<string, string[]>;
		/** Form validation errors keyed as attr_<fieldKey> (form mode). */
		errors?: Record<string, string>;
	};

	let { mode, groups, values = {}, filterAttributes = {}, errors = {} }: Props = $props();

	let openCategories = $state<Record<string, boolean>>({});

	function isCategoryOpen(key: string): boolean {
		return openCategories[key] ?? false;
	}

	function toggleCategory(key: string) {
		openCategories[key] = !isCategoryOpen(key);
	}

	function activeCountInGroup(group: AttributeFieldGroup): number {
		if (mode === 'search') {
			return countActiveFiltersInGroup(group, filterAttributes);
		}
		return group.fields.filter((field) => {
			const value = values[field.key];
			if (value === undefined || value === null || value === '') return false;
			if (field.type === 'boolean') return value === true;
			return true;
		}).length;
	}

	function hasActiveFiltersInGroup(group: AttributeFieldGroup): boolean {
		if (mode === 'search') {
			return activeCountInGroup(group) > 0;
		}
		return group.fields.some((field) => {
			const value = values[field.key];
			if (value === undefined || value === null || value === '') return false;
			if (field.type === 'boolean') return value === true;
			return true;
		});
	}
</script>

{#if groups.length > 0}
	<div class="space-y-3">
		{#each groups as group (group.category.key)}
			{@const activeCount = activeCountInGroup(group)}
			<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
				<button
					type="button"
					class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
					onclick={() => toggleCategory(group.category.key)}
					aria-expanded={isCategoryOpen(group.category.key)}
				>
					<span>{group.category.label}</span>
					<span class="flex items-center gap-2">
						{#if activeCount > 0}
							<span class="rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-bold text-white">
								{activeCount}
							</span>
						{/if}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4 text-gray-500 transition-transform duration-200 {isCategoryOpen(
								group.category.key
							) || hasActiveFiltersInGroup(group)
								? 'rotate-180'
								: ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</span>
				</button>

				<div
					class="grid transition-[grid-template-rows] duration-300 ease-out"
					style:grid-template-rows={isCategoryOpen(group.category.key) ||
					hasActiveFiltersInGroup(group)
						? '1fr'
						: '0fr'}
				>
					<div class="overflow-hidden">
						<div class="border-t border-gray-100 px-4 pt-4 pb-4">
							<div class={mode === 'form' ? 'grid gap-4 sm:grid-cols-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
							{#each group.fields as field (field.key)}
								{@const selectedValues = filterAttributes[field.key] ?? []}
								{@const attrValue = values[field.key]}
								<div
									class={mode === 'form' && field.type === 'boolean'
										? 'flex items-center gap-2 sm:col-span-2'
										: mode === 'search' && field.type === 'boolean'
											? 'flex items-center gap-2'
											: mode === 'search'
												? 'sm:col-span-2'
												: ''}
								>
									{#if mode === 'form'}
										{#if field.type === 'boolean'}
											<input
												id={`attr_${field.key}`}
												name={`attr_${field.key}`}
												type="checkbox"
												value="true"
												checked={attrValue === true}
												class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
											/>
											<label for={`attr_${field.key}`} class="text-sm font-medium text-gray-700">
												{field.label}
											</label>
										{:else if field.type === 'select'}
											<div class="sm:col-span-1">
												<label
													for={`attr_${field.key}`}
													class="block text-sm font-medium text-gray-700">{field.label}</label
												>
												<select
													id={`attr_${field.key}`}
													name={`attr_${field.key}`}
													required={field.required}
													class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
												>
													<option value="">— Odaberi —</option>
													{#each field.options ?? [] as option}
														<option value={option} selected={attrValue === option}>{option}</option>
													{/each}
												</select>
												{#if errors[`attr_${field.key}`]}
													<p class="mt-1 text-sm text-red-600">{errors[`attr_${field.key}`]}</p>
												{/if}
											</div>
										{:else}
											<div class="sm:col-span-1">
												<label
													for={`attr_${field.key}`}
													class="block text-sm font-medium text-gray-700">{field.label}</label
												>
												<input
													id={`attr_${field.key}`}
													name={`attr_${field.key}`}
													type={field.type === 'number' ? 'number' : 'text'}
													min={field.min}
													max={field.max}
													placeholder={field.placeholder}
													value={attrValue ?? ''}
													class="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
												/>
											</div>
										{/if}
									{:else if field.type === 'select' && field.options}
										<span class="mb-1.5 block text-xs font-medium text-gray-700">{field.label}</span>
										<div
											class="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3"
										>
											{#each field.options as option}
												<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
													<input
														type="checkbox"
														name="a_{field.key}"
														value={option}
														checked={selectedValues.includes(option)}
														class="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
													/>
													{option}
												</label>
											{/each}
										</div>
										<p class="mt-1 text-xs text-gray-500">Možete odabrati više vrijednosti</p>
									{:else if field.type === 'boolean'}
										<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
											<input
												type="checkbox"
												name="a_{field.key}"
												value="true"
												checked={selectedValues.includes('true')}
												class="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
											/>
											{field.label}
										</label>
									{:else if field.type === 'number'}
										<label for="attr-{field.key}" class="mb-1.5 block text-xs font-medium text-gray-700">
											{field.label}
										</label>
										<input
											id="attr-{field.key}"
											name="a_{field.key}"
											type="number"
											min={field.min}
											max={field.max}
											value={selectedValues[0] ?? ''}
											placeholder={field.placeholder ?? `Min. ${field.label.toLowerCase()}`}
											class="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-yellow-500"
										/>
										<p class="mt-1 text-xs text-gray-500">Minimalna vrijednost</p>
									{/if}
								</div>
							{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
