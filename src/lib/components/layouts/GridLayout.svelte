<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header: Snippet;
		controls?: Snippet;
		children: Snippet;
	}

	const { header, controls, children }: Props = $props();
</script>

<div class="flex flex-col gap-4">
	{@render header()}
	{#if controls}
		{@render controls()}
	{/if}
	{@render children()}
</div>
