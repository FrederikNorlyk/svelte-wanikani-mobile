<script lang="ts">
	import { cn, type WithElementRef } from '$lib/shadcn/utils.js';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLFieldsetAttributes> = $props();
</script>

<fieldset
	bind:this={ref}
	class={cn(
		'flex flex-col gap-6',
		'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
		className
	)}
	data-slot="field-set"
	{...restProps}
>
	{@render children?.()}
</fieldset>
