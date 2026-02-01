<script lang="ts">
	import { Progress as ProgressPrimitive } from 'bits-ui';
	import { cn, type WithoutChildrenOrChild } from '$lib/shadcn/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();
</script>

<ProgressPrimitive.Root
	class={cn(
		'relative h-2 w-full overflow-hidden rounded-full bg-primary/10',
		className
	)}
	data-slot="progress"
	{max}
	{value}
	bind:ref
	{...restProps}
>
	<div
		style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
		class="h-full w-full flex-1 bg-primary/20 transition-all"
		data-slot="progress-indicator"
	></div>
</ProgressPrimitive.Root>
