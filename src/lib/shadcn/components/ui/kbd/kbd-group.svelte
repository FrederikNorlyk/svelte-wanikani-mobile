<script lang="ts">
	import { cn, type WithElementRef } from '$lib/shadcn/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<kbd
	bind:this={ref}
	class={cn('inline-flex items-center gap-1', className)}
	data-slot="kbd-group"
	{...restProps}
>
	{@render children?.()}
</kbd>
