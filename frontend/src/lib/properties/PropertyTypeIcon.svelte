<script lang="ts">
	import type { PropertyType } from '$lib/types/property';
	import { PROPERTY_TYPE_ICON_SVG } from '$lib/properties/propertyTypeIcons';

	type Props = {
		type: PropertyType;
		/** Tailwind classes for size and color (uses currentColor inside the SVG). */
		class?: string;
	};

	let { type, class: className = 'h-8 w-8 text-yellow-500' }: Props = $props();
</script>

<span class="inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full {className}" aria-hidden="true">
	{@html PROPERTY_TYPE_ICON_SVG[type]}
</span>
