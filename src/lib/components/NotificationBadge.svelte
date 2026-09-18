<script lang="ts">
	import { cn } from '$lib/shadcn/utils';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<span class={cn('h-6 w-6 rounded-full bg-red-600', className)}></span>
