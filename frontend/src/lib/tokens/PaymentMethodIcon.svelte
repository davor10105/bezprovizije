<script lang="ts">
	import type { BpPaymentMethod } from '$lib/types/tokens';
	import { PAYMENT_METHOD_ICON_SVG } from '$lib/tokens/paymentMethodIcons';

	type Props = {
		method: BpPaymentMethod;
		/** Tailwind classes for size and color (uses currentColor inside the SVG). */
		class?: string;
	};

	let { method, class: className = 'h-8 w-8 text-yellow-500' }: Props = $props();
</script>

<span
	class="inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full {className}"
	aria-hidden="true"
>
	{@html PAYMENT_METHOD_ICON_SVG[method]}
</span>
