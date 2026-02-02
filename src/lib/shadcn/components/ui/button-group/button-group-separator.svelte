<script lang="ts">
	import { cn } from '$lib/shadcn/utils.js';
	import type { ComponentProps } from 'svelte';
	import { Separator } from '$lib/shadcn/components/ui/separator/index.js';

	let {
		ref = $bindable(null),
		class: className,
		orientation = 'vertical',
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	class={cn(
		'relative m-0! self-stretch bg-input data-[orientation=vertical]:h-auto',
		className
	)}
	data-slot="button-group-separator"
	{orientation}
	bind:ref
	{...restProps}
/>
