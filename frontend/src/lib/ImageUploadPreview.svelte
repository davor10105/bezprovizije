<script lang="ts">
	import { onDestroy } from 'svelte';

	interface Props {
		files?: File[];
		maxImages?: number;
		error?: string;
	}

	let {
		files = $bindable([]),
		maxImages = 12,
		error = ''
	}: Props = $props();

	let fileInput: HTMLInputElement;
	let previews = $state<{ id: string; url: string; file: File }[]>([]);
	let dragOver = $state(false);

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
		setFiles([...files, ...accepted].slice(0, maxImages));
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (input.files?.length) {
			addFiles(input.files);
		}
		input.value = '';
	}

	function removeFile(index: number) {
		setFiles(files.filter((_, i) => i !== index));
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
	<label for="images" class="block text-sm font-semibold text-gray-700">Fotografije</label>

	<div
		class="mt-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition {dragOver
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
			Povucite fotografije ovdje ili
			<button
				type="button"
				class="font-semibold text-yellow-600 hover:text-yellow-700"
				onclick={() => fileInput?.click()}
			>
				odaberite s uređaja
			</button>
		</p>
		<p class="mt-1 text-xs text-gray-500">
			Najmanje 1 fotografija, najviše {maxImages} (max 5 MB po slici).
		</p>
		<input
			bind:this={fileInput}
			id="images"
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif"
			multiple
			class="sr-only"
			onchange={onFileChange}
		/>
	</div>

	{#if previews.length > 0}
		<ul class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each previews as preview, index (preview.id)}
				<li class="group relative aspect-4/3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
					<img src={preview.url} alt="Pregled fotografije {index + 1}" class="h-full w-full object-cover" />
					<button
						type="button"
						class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
						aria-label="Ukloni fotografiju"
						onclick={() => removeFile(index)}
					>
						×
					</button>
					<span class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
						{index + 1}
					</span>
				</li>
			{/each}
			{#if files.length < maxImages}
				<li>
					<button
						type="button"
						class="flex aspect-4/3 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-500 transition hover:border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700"
						onclick={() => fileInput?.click()}
					>
						<span class="text-2xl">+</span>
						<span class="mt-1 text-xs font-medium">Dodaj još</span>
					</button>
				</li>
			{/if}
		</ul>
	{/if}

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
