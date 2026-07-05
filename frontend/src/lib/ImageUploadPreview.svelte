<script lang="ts">
	import { onDestroy } from 'svelte';
	import OrderedImageCard from '$lib/OrderedImageCard.svelte';
	import { moveArrayItem } from '$lib/properties/imageOrder';

	interface Props {
		files?: File[];
		maxImages?: number;
		error?: string;
	}

	type OrderItem = {
		id: string;
		url: string;
		file: File;
	};

	let {
		files = $bindable([]),
		maxImages = 12,
		error = ''
	}: Props = $props();

	let fileInput: HTMLInputElement;
	let orderedItems = $state<OrderItem[]>([]);
	let dragOverZone = $state(false);
	let dragIndex = $state<number | null>(null);
	let dropIndex = $state<number | null>(null);

	function syncFilesFromOrder() {
		files = orderedItems.map((item) => item.file);
	}

	function moveItem(fromIndex: number, toIndex: number) {
		orderedItems = moveArrayItem(orderedItems, fromIndex, toIndex);
		syncFilesFromOrder();
	}

	function addFiles(incoming: FileList | File[]) {
		const accepted = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
		const remaining = maxImages - orderedItems.length;
		if (remaining <= 0) return;

		const newItems = accepted.slice(0, remaining).map((file) => ({
			id: crypto.randomUUID(),
			url: URL.createObjectURL(file),
			file
		}));

		orderedItems = [...orderedItems, ...newItems];
		syncFilesFromOrder();
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (input.files?.length) {
			addFiles(input.files);
		}
		input.value = '';
	}

	function removeAt(index: number) {
		const item = orderedItems[index];
		URL.revokeObjectURL(item.url);
		orderedItems = orderedItems.filter((_, itemIndex) => itemIndex !== index);
		syncFilesFromOrder();
	}

	function onDropFiles(event: DragEvent) {
		event.preventDefault();
		dragOverZone = false;
		if (event.dataTransfer?.files?.length) {
			addFiles(event.dataTransfer.files);
		}
	}

	function onCardDragStart(event: DragEvent, index: number) {
		dragIndex = index;
		dropIndex = index;
		event.dataTransfer?.setData('text/plain', String(index));
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function onCardDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (dragIndex !== null) {
			dropIndex = index;
		}
	}

	function onCardDrop(event: DragEvent, index: number) {
		event.preventDefault();
		if (dragIndex !== null) {
			moveItem(dragIndex, index);
		}
		clearDragState();
	}

	function clearDragState() {
		dragIndex = null;
		dropIndex = null;
	}

	onDestroy(() => {
		for (const item of orderedItems) {
			URL.revokeObjectURL(item.url);
		}
	});
</script>

<div>
	<label for="images" class="block text-sm font-semibold text-gray-700">Fotografije</label>
	<p class="mt-1 text-xs text-gray-500">
		Prva fotografija je naslovna. Povucite slike ili koristite strelice za promjenu redoslijeda.
	</p>

	<div
		class="mt-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition {dragOverZone
			? 'border-yellow-500 bg-yellow-50'
			: 'border-gray-200 bg-gray-50/50'}"
		ondragover={(event) => {
			event.preventDefault();
			dragOverZone = true;
		}}
		ondragleave={() => (dragOverZone = false)}
		ondrop={onDropFiles}
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

	{#if orderedItems.length > 0}
		<ul class="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-3">
			{#each orderedItems as item, index (item.id)}
				<OrderedImageCard
					url={item.url}
					alt="Pregled fotografije {index + 1}"
					{index}
					total={orderedItems.length}
					onRemove={() => removeAt(index)}
					onMoveLeft={() => moveItem(index, index - 1)}
					onMoveRight={() => moveItem(index, index + 1)}
					isDragOver={dropIndex === index && dragIndex !== null && dragIndex !== index}
					onDragStart={(event) => onCardDragStart(event, index)}
					onDragOver={(event) => onCardDragOver(event, index)}
					onDrop={(event) => onCardDrop(event, index)}
					onDragEnd={clearDragState}
				/>
			{/each}
			{#if orderedItems.length < maxImages}
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
