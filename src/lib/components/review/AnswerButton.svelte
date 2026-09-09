<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	interface Props {
		type: 'correct' | 'wrong';
		onclick: () => void;
	}

	const { type, onclick }: Props = $props();
</script>

<Button class="flex-1" {onclick} size="medium" variant="secondary">
	{#if type === 'correct'}
		Knew it
	{:else}
		Didn't know
	{/if}
</Button>
