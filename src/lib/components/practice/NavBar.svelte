<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Button from '$lib/components/button/Button.svelte';
	import { type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onBackButtonPressed: () => void;
	}

	const { children, onBackButtonPressed }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<Button
		class="h-10"
		buttonColor="red"
		onclick={onBackButtonPressed}
		size="medium"
	>
		<ArrowLeft />
	</Button>
	<h1 class="text-3xl">
		{@render children()}
	</h1>
</div>

<style>
	h1 {
		color: light-dark(white, var(--foreground));
	}
</style>
