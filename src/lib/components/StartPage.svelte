<script lang="ts">
	import type { Assignment } from '$lib/functions/assignments.remote';
	import { Button } from '$lib/shadcn/components/ui/button';

	interface Props {
		assignments: Assignment[];
		onStartReview: () => void;
	}

	const { assignments, onStartReview }: Props = $props();
</script>

<p>You have {assignments.length} assignment(s)</p>
<Button onclick={onStartReview}>Review!</Button>
