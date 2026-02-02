<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/shadcn/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.TitleProps = $props();
</script>

<DrawerPrimitive.Title
	class={cn('font-semibold text-foreground', className)}
	data-slot="drawer-title"
	bind:ref
	{...restProps}
/>
