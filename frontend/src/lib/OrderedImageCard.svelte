<script lang="ts">
	type Props = {
		url: string;
		alt: string;
		index: number;
		total: number;
		/** e.g. "Nova" for newly added uploads */
		badge?: string;
		borderClass?: string;
		onRemove: () => void;
		onMoveLeft: () => void;
		onMoveRight: () => void;
		onDragStart?: (event: DragEvent) => void;
		onDragOver?: (event: DragEvent) => void;
		onDrop?: (event: DragEvent) => void;
		onDragEnd?: () => void;
		isDragOver?: boolean;
	};

	let {
		url,
		alt,
		index,
		total,
		badge = '',
		borderClass = 'border-gray-200',
		onRemove,
		onMoveLeft,
		onMoveRight,
		onDragStart,
		onDragOver,
		onDrop,
		onDragEnd,
		isDragOver = false
	}: Props = $props();

	const canReorder = $derived(total > 1);
	const isCover = $derived(index === 0);
</script>

<li
	class="group relative aspect-4/3 overflow-hidden rounded-xl border bg-gray-100 transition {borderClass} {isDragOver
		? 'ring-2 ring-yellow-500 ring-offset-2'
		: ''}"
	draggable={canReorder}
	ondragstart={onDragStart}
	ondragover={onDragOver}
	ondrop={onDrop}
	ondragend={onDragEnd}
>
	<img src={url} {alt} class="pointer-events-none h-full w-full object-cover select-none" />

	{#if isCover}
		<span
			class="absolute top-2 left-2 rounded bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-gray-900"
		>
			Naslovna
		</span>
	{:else}
		<span class="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
			{index + 1}
		</span>
	{/if}

	{#if badge}
		<span class="absolute top-2 right-12 rounded bg-yellow-600 px-2 py-0.5 text-xs text-white">
			{badge}
		</span>
	{/if}

	<button
		type="button"
		class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-base font-bold text-white hover:bg-red-600 sm:opacity-90"
		aria-label="Ukloni fotografiju"
		onclick={onRemove}
	>
		×
	</button>

	{#if canReorder}
		<div
			class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/75 to-transparent px-2 pt-8 pb-2"
		>
			<button
				type="button"
				class="flex h-9 min-w-9 flex-1 items-center justify-center rounded-lg bg-white/95 text-sm font-bold text-gray-800 shadow disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Pomakni lijevo"
				disabled={index === 0}
				onclick={onMoveLeft}
			>
				←
			</button>
			<button
				type="button"
				class="flex h-9 min-w-9 flex-1 items-center justify-center rounded-lg bg-white/95 text-sm font-bold text-gray-800 shadow disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Pomakni desno"
				disabled={index === total - 1}
				onclick={onMoveRight}
			>
				→
			</button>
		</div>
	{/if}
</li>
