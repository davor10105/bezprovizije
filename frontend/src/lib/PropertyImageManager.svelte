<script lang="ts">
	import { onDestroy } from 'svelte';
	import OrderedImageCard from '$lib/OrderedImageCard.svelte';
	import {
		existingImageOrderToken,
		IMAGE_ORDER_NEW,
		moveArrayItem
	} from '$lib/properties/imageOrder';

	export type ExistingImage = {
		id: string;
		url: string;
	};

	type OrderItem =
		| { kind: 'existing'; id: string; url: string }
		| { kind: 'new'; id: string; url: string; file: File };

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
	let orderedItems = $state<OrderItem[]>(
		existingImages.map((image) => ({
			kind: 'existing' as const,
			id: image.id,
			url: image.url
		}))
	);
	let dragOverZone = $state(false);
	let dragIndex = $state<number | null>(null);
	let dropIndex = $state<number | null>(null);

	const totalCount = $derived(orderedItems.length);

	function syncFilesFromOrder() {
		files = orderedItems.filter((item) => item.kind === 'new').map((item) => item.file);
	}

	function moveItem(fromIndex: number, toIndex: number) {
		orderedItems = moveArrayItem(orderedItems, fromIndex, toIndex);
		syncFilesFromOrder();
	}

	function addFiles(incoming: FileList | File[]) {
		const accepted = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
		const remaining = maxImages - orderedItems.length;
		if (remaining <= 0) return;

		const newItems: OrderItem[] = accepted.slice(0, remaining).map((file) => ({
			kind: 'new' as const,
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
		if (item.kind === 'existing') {
			if (!removedImageIds.includes(item.id)) {
				removedImageIds = [...removedImageIds, item.id];
			}
		} else {
			URL.revokeObjectURL(item.url);
		}

		orderedItems = orderedItems.filter((_, itemIndex) => itemIndex !== index);
		syncFilesFromOrder();
	}

	function restoreExisting(id: string) {
		const image = existingImages.find((item) => item.id === id);
		if (!image || orderedItems.length >= maxImages) return;

		removedImageIds = removedImageIds.filter((imageId) => imageId !== id);
		orderedItems = [
			...orderedItems,
			{ kind: 'existing', id: image.id, url: image.url }
		];
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
			if (item.kind === 'new') {
				URL.revokeObjectURL(item.url);
			}
		}
	});
</script>

<div>
	<label for="edit-images" class="block text-sm font-semibold text-gray-700">Fotografije</label>
	<p class="mt-1 text-xs text-gray-500">
		Prva fotografija je naslovna. Povucite slike ili koristite strelice za promjenu redoslijeda.
	</p>

	{#if orderedItems.length > 0}
		<ul class="mt-3 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:grid-cols-3">
			{#each orderedItems as item, index (item.kind === 'existing' ? item.id : item.id)}
				<OrderedImageCard
					url={item.url}
					alt="Fotografija {index + 1}"
					{index}
					total={orderedItems.length}
					badge={item.kind === 'new' ? 'Nova' : ''}
					borderClass={item.kind === 'new' ? 'border-yellow-300' : 'border-gray-200'}
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
		</ul>
	{/if}

	{#each orderedItems as item (item.kind === 'existing' ? `order-${item.id}` : `order-new-${item.id}`)}
		<input
			type="hidden"
			name="image_order"
			value={item.kind === 'existing' ? existingImageOrderToken(item.id) : IMAGE_ORDER_NEW}
		/>
	{/each}

	{#each removedImageIds as id (id)}
		<input type="hidden" name="remove_image_ids" value={id} />
	{/each}

	<div
		class="mt-3 rounded-xl border-2 border-dashed px-4 py-5 text-center transition {dragOverZone
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
				{@const image = existingImages.find((item) => item.id === id)}
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
