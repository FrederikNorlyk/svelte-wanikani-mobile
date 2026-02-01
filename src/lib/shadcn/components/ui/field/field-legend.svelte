<script lang="ts">
	import { cn, type WithElementRef } from '$lib/shadcn/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'legend',
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLegendElement>> & {
		variant?: 'legend' | 'label';
	} = $props();
</script>

<legend
	bind:this={ref}
	class={cn(
		'mb-3 font-medium',
		'data-[variant=legend]:text-base',
		'data-[variant=label]:text-sm',
		className
	)}
	data-slot="field-legend"
	data-variant={variant}
	{...restProps}
>
	{@render children?.()}
</legend>
