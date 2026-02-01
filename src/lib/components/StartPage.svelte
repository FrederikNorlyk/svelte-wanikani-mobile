<script lang="ts">
	import { Button } from '$lib/shadcn/components/ui/button';
	import slump_good_man_study from '$lib/assets/irasutoya/slump_good_man_study.png';
	import study_night_boy from '$lib/assets/irasutoya/study_night_boy.png';
	import study_chienetsu_boy from '$lib/assets/irasutoya/study_chienetsu_boy.png';
	import kokage_tree_necchusyou from '$lib/assets/irasutoya/kokage_tree_necchusyou.png';
	import Illustration from '$lib/components/Illustration.svelte';

	interface Props {
		numberOfAssignments: number;
		onStartReview: () => void;
	}

	const { numberOfAssignments, onStartReview }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-center justify-center">
	{#if numberOfAssignments === 0}
		<Illustration alt="Boy resting under a tree" src={kokage_tree_necchusyou}>
			You have no reviews
		</Illustration>
	{:else if numberOfAssignments < 10}
		<Illustration alt="Man working effortlessly" src={slump_good_man_study}>
			{#if numberOfAssignments === 1}
				You've got just a single review.
			{:else}
				You've only got <b>{numberOfAssignments}</b> reviews.
			{/if}
		</Illustration>
	{:else if numberOfAssignments < 99}
		<Illustration alt="Boy studying hard" src={study_night_boy}>
			You've got <b>{numberOfAssignments}</b> reviews.
		</Illustration>
	{:else}
		<Illustration alt="Boy overwhelmed by work" src={study_chienetsu_boy}>
			Damn! You've got <b>{numberOfAssignments}</b> reviews.
		</Illustration>
	{/if}
</div>

{#if numberOfAssignments > 0}
	<Button class="flex h-20" onclick={onStartReview}>Start reviewing!</Button>
{/if}
