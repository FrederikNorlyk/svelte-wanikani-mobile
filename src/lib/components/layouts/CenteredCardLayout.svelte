<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		actions?: Snippet;
	}

	const { children, actions }: Props = $props();
</script>

<div class="flex flex-auto flex-col gap-8">
	<div class="flex flex-auto flex-col justify-center">
		{@render children()}
	</div>

	{#if actions}
		<div class="flex shrink-0 flex-col">
			{@render actions()}
		</div>
	{/if}
</div>
