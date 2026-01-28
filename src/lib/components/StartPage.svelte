<script lang="ts">
	import type { Assignment } from '$lib/functions/assignments.remote';
	import { Button } from '$lib/shadcn/components/ui/button';

	interface Props {
		assignments: Assignment[];
		onStartReview: () => void;
	}

	const { assignments, onStartReview }: Props = $props();
</script>

<div class="flex flex-1 flex-col gap-2">
	<p class="flex flex-1 items-center justify-center">
		{#if assignments.length === 1}
			You have 1 assignment
		{:else}
			You have {assignments.length} assignment(s)
		{/if}
	</p>
	<div class="flex">
		<Button class="h-20 flex-1" onclick={onStartReview}>Review!</Button>
	</div>
</div>
