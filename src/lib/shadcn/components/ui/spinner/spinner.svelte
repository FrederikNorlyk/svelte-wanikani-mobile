<script lang="ts">
	import { cn } from '$lib/shadcn/utils.js';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import type { ComponentProps } from 'svelte';

	let { class: className, ...restProps }: ComponentProps<typeof Loader2Icon> =
		$props();
</script>

<Loader2Icon
	class={cn('size-4 animate-spin', className)}
	aria-label="Loading"
	role="status"
	{...restProps}
/>
