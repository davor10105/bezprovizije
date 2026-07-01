<script lang="ts">
	import { onDestroy } from 'svelte';

	export type ExistingImage = {
		id: string;
		url: string;
	};

	interface Props {
		files?: File[];
		existingImages?: ExistingImage[];
		removedImageIds?: string[];
		maxImages?: number;
		error?: string;
	}

	let {
		files = $bindable([]),
		existingImages = $bindable([]),
		removedImageIds = $bindable([]),
		maxImages = 12,
		error = ''
	}: Props = $props();

	let fileInput: HTMLInputElement;
	let previews = $state<{ id: string; url: string; file: File }[]>([]);
	let dragOver = $state(false);

	const visibleExisting = $derived(
		existingImages.filter((img) => !removedImageIds.includes(img.id))
	);

	const totalCount = $derived(visibleExisting.length + files.length);

	function updatePreviews(newFiles: File[]) {
		const previous = previews;
		const next = newFiles.map((file) => {
			const existing = previous.find((preview) => preview.file === file);
			if (existing) return existing;
			return {
				id: crypto.randomUUID(),
				url: URL.createObjectURL(file),
				file
			};
		});

		for (const preview of previous) {
			if (!next.includes(preview)) {
				URL.revokeObjectURL(preview.url);
			}
		}

		previews = next;
	}

	function setFiles(newFiles: File[]) {
		files = newFiles;
		updatePreviews(newFiles);
	}

	function addFiles(incoming: FileList | File[]) {
		const accepted = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
		const remaining = maxImages - visibleExisting.length;
		setFiles([...files, ...accepted].slice(0, remaining));
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (input.files?.length) {
			addFiles(input.files);
		}
		input.value = '';
	}

	function removeNewFile(index: number) {
		setFiles(files.filter((_, i) => i !== index));
	}

	function removeExisting(id: string) {
		if (!removedImageIds.includes(id)) {
			removedImageIds = [...removedImageIds, id];
		}
	}

	function restoreExisting(id: string) {
		removedImageIds = removedImageIds.filter((imageId) => imageId !== id);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		if (event.dataTransfer?.files?.length) {
			addFiles(event.dataTransfer.files);
		}
	}

	onDestroy(() => {
		for (const preview of previews) {
			URL.revokeObjectURL(preview.url);
		}
	});
</script>

<div>
	<label for="edit-images" class="block text-sm font-semibold text-gray-700">Fotografije</label>

	{#if visibleExisting.length > 0 || previews.length > 0}
		<ul class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each visibleExisting as image, index (image.id)}
				<li class="group relative aspect-4/3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
					<img src={image.url} alt="Postojeća fotografija {index + 1}" class="h-full w-full object-cover" />
					<button
						type="button"
						class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
						aria-label="Ukloni fotografiju"
						onclick={() => removeExisting(image.id)}
					>
						×
					</button>
					<span class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
						{index + 1}
					</span>
				</li>
			{/each}

			{#each previews as preview, index (preview.id)}
				<li class="group relative aspect-4/3 overflow-hidden rounded-xl border border-yellow-300 bg-gray-100">
					<img src={preview.url} alt="Nova fotografija {index + 1}" class="h-full w-full object-cover" />
					<button
						type="button"
						class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
						aria-label="Ukloni fotografiju"
						onclick={() => removeNewFile(index)}
					>
						×
					</button>
					<span class="absolute bottom-2 left-2 rounded bg-yellow-600 px-2 py-0.5 text-xs text-white">
						Nova
					</span>
				</li>
			{/each}
		</ul>
	{/if}

	{#each removedImageIds as id (id)}
		<input type="hidden" name="remove_image_ids" value={id} />
	{/each}

	<div
		class="mt-3 rounded-xl border-2 border-dashed px-4 py-5 text-center transition {dragOver
			? 'border-yellow-500 bg-yellow-50'
			: 'border-gray-200 bg-gray-50/50'}"
		ondragover={(e) => {
			e.preventDefault();
			dragOver = true;
		}}
		ondragleave={() => (dragOver = false)}
		ondrop={onDrop}
		role="presentation"
	>
		<p class="text-sm text-gray-600">
			{#if totalCount < maxImages}
				<button
					type="button"
					class="font-semibold text-yellow-600 hover:text-yellow-700"
					onclick={() => fileInput?.click()}
				>
					Dodaj fotografije
				</button>
				<span class="text-gray-500"> ({totalCount}/{maxImages})</span>
			{:else}
				<span class="text-gray-500">Dosegnut je maksimum od {maxImages} fotografija.</span>
			{/if}
		</p>
		<input
			bind:this={fileInput}
			id="edit-images"
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif"
			multiple
			class="sr-only"
			onchange={onFileChange}
		/>
	</div>

	{#if removedImageIds.length > 0}
		<div class="mt-3 flex flex-wrap gap-2">
			{#each removedImageIds as id (id)}
				{@const image = existingImages.find((img) => img.id === id)}
				{#if image}
					<button
						type="button"
						class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
						onclick={() => restoreExisting(id)}
					>
						Vrati uklonjenu fotografiju
					</button>
				{/if}
			{/each}
		</div>
	{/if}

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
