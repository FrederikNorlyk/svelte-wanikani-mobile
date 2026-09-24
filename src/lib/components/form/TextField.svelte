<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/shadcn/utils';

	let {
		ref = $bindable(null),
		class: className,
		...props
	}: HTMLInputAttributes & {
		ref?: HTMLInputElement | null;
		class?: string;
	} = $props();
</script>

<input
	bind:this={ref}
	class={cn(
		'h-16 rounded-sm border-2 px-4 text-lg font-semibold shadow-[inset_0_2px_4px_rgb(91_58_39/8%)]',
		className
	)}
	{...props}
/>

<style>
	input {
		background: light-dark(#fffdf7, #293d62);
		border-color: light-dark(#c8b58f, #52627d);
	}
</style>
