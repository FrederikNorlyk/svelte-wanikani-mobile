<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		actions?: Snippet;
	}

	const { children, actions }: Props = $props();
</script>

<div class="mx-auto flex w-full max-w-110 flex-auto flex-col gap-8">
	<div class="flex flex-auto flex-col justify-center">
		{@render children()}
	</div>

	{#if actions}
		<div class="flex shrink-0 flex-col">
			{@render actions()}
		</div>
	{/if}
</div>
