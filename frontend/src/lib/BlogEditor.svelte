<script lang="ts">
	import { renderMarkdown } from '$lib/blog/markdown';

	let {
		title = $bindable(''),
		description = $bindable(''),
		content = $bindable(''),
		errors = {},
		submitLabel = 'Spremi'
	}: {
		title?: string;
		description?: string;
		content?: string;
		errors?: Record<string, string>;
		submitLabel?: string;
	} = $props();

	let contentEl = $state<HTMLTextAreaElement | null>(null);
	let uploading = $state(false);
	let uploadError = $state('');

	const previewHtml = $derived(renderMarkdown(content || ''));

	function insertAtCursor(before: string, after = '') {
		if (!contentEl) return;
		const start = contentEl.selectionStart;
		const end = contentEl.selectionEnd;
		const selected = content.slice(start, end);
		content = content.slice(0, start) + before + selected + after + content.slice(end);
		queueMicrotask(() => {
			contentEl?.focus();
			const pos = start + before.length + selected.length + after.length;
			contentEl?.setSelectionRange(pos, pos);
		});
	}

	function wrapSelection(wrapper: string) {
		insertAtCursor(wrapper, wrapper);
	}

	function addLink() {
		const url = window.prompt('URL poveznice:', 'https://');
		if (!url) return;
		const label = window.prompt('Tekst poveznice:', 'Pročitaj više');
		if (!label) return;
		insertAtCursor(`[${label}](${url})`);
	}

	async function uploadImage(file: File) {
		uploadError = '';
		uploading = true;

		try {
			const body = new FormData();
			body.append('image', file);

			const response = await fetch('/api/blog/upload-image', {
				method: 'POST',
				body
			});

			const result = await response.json();

			if (!response.ok) {
				uploadError = result.error ?? 'Učitavanje slike nije uspjelo.';
				return;
			}

			const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
			insertAtCursor(`\n\n![${alt}](${result.url})\n\n`);
		} catch {
			uploadError = 'Učitavanje slike nije uspjelo.';
		} finally {
			uploading = false;
		}
	}

	function onImagePick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) uploadImage(file);
		input.value = '';
	}
</script>

<div class="grid gap-8 lg:grid-cols-2 lg:items-start">
	<div class="space-y-6">
		<div>
			<label for="title" class="mb-1.5 block text-sm font-semibold text-gray-700">Naslov</label>
			<input
				id="title"
				name="title"
				type="text"
				bind:value={title}
				required
				class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
				placeholder="Naslov članka"
			/>
			{#if errors.title}
				<p class="mt-1 text-sm text-red-600">{errors.title}</p>
			{/if}
		</div>

		<div>
			<label for="description" class="mb-1.5 block text-sm font-semibold text-gray-700">
				Kratki opis
			</label>
			<textarea
				id="description"
				name="description"
				bind:value={description}
				rows="3"
				required
				class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
				placeholder="Kratak opis koji se prikazuje na kartici članka"
			></textarea>
			{#if errors.description}
				<p class="mt-1 text-sm text-red-600">{errors.description}</p>
			{/if}
		</div>

		<div>
			<label for="content" class="mb-1.5 block text-sm font-semibold text-gray-700">Sadržaj</label>

			<div class="mb-2 flex flex-wrap gap-2">
				<button
					type="button"
					class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
					onclick={() => wrapSelection('**')}
				>
					Podebljano
				</button>
				<button
					type="button"
					class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
					onclick={() => wrapSelection('*')}
				>
					Kurziv
				</button>
				<button
					type="button"
					class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
					onclick={addLink}
				>
					Poveznica
				</button>
				<label
					class="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 {uploading
						? 'pointer-events-none opacity-50'
						: ''}"
				>
					{uploading ? 'Učitavanje...' : 'Slika'}
					<input type="file" accept="image/*" class="hidden" onchange={onImagePick} />
				</label>
			</div>

			<textarea
				id="content"
				name="content"
				bind:this={contentEl}
				bind:value={content}
				rows="16"
				required
				class="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm text-gray-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
				placeholder="Pišite sadržaj članka. Podržava markdown: **podebljano**, *kurziv*, [poveznica](url), ![slika](url)"
			></textarea>
			{#if errors.content}
				<p class="mt-1 text-sm text-red-600">{errors.content}</p>
			{/if}
			{#if uploadError}
				<p class="mt-1 text-sm text-red-600">{uploadError}</p>
			{/if}
			<p class="mt-2 text-xs text-gray-500">
				Koristite alatnu traku za formatiranje, poveznice i učitavanje slika.
			</p>
		</div>

		<button
			type="submit"
			class="rounded-xl bg-yellow-500 px-6 py-3 font-bold text-white hover:bg-yellow-600"
		>
			{submitLabel}
		</button>
	</div>

	<aside class="lg:sticky lg:top-8">
		<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Pregled</p>
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			{#if title}
				<h2 class="text-2xl font-extrabold text-gray-900">{title}</h2>
			{:else}
				<h2 class="text-2xl font-extrabold text-gray-300">Naslov članka</h2>
			{/if}

			{#if description}
				<p class="mt-3 text-gray-600">{description}</p>
			{:else}
				<p class="mt-3 text-gray-300">Kratki opis članka...</p>
			{/if}

			<div class="mt-6 border-t border-gray-100 pt-6">
				{#if content}
					<div
						class="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-yellow-700 prose-img:rounded-xl"
					>
						{@html previewHtml}
					</div>
				{:else}
					<p class="text-sm text-gray-300">Sadržaj članka pojavit će se ovdje...</p>
				{/if}
			</div>
		</div>
	</aside>
</div>
