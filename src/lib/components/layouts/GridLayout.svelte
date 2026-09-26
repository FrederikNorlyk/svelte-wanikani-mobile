<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '$lib/components/Card.svelte';

	interface Props {
		header: Snippet;
		controls?: Snippet;
		children: Snippet;
	}

	const { header, controls, children }: Props = $props();
</script>

<div class="flex flex-auto flex-col gap-4">
	{@render header()}
	{#if controls}
		{@render controls()}
	{/if}

	<Card class="grid grid-cols-4 gap-2 p-2">
		{@render children()}
	</Card>
</div>
