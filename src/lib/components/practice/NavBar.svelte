<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Button from '$lib/components/Button.svelte';
	import { type Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onBackButtonPressed: () => void;
	}

	const { children, onBackButtonPressed }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<Button onclick={onBackButtonPressed} size="icon">
		<ArrowLeft />
	</Button>
	<h1 class="text-3xl">
		{@render children()}
	</h1>
</div>
