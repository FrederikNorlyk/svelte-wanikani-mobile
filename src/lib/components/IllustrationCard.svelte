<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import { cn } from '$lib/shadcn/utils';

	interface Props {
		alt: string;
		children: Snippet;
		src: string;
		class?: string;
	}

	const { alt, children, src, class: className = '' }: Props = $props();
</script>

<Card class={cn('w-full px-6 py-8 sm:px-12 sm:py-10', className)}>
	<div class="flex flex-col items-center gap-4 text-center">
		<img {alt} {src} />
		{@render children()}
	</div>
</Card>

<style>
	img {
		width: 200px;
		height: 200px;
		object-fit: contain;
	}
</style>
