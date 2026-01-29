<script lang="ts">
	import { Button } from '$lib/shadcn/components/ui/button';
	import slump_good_man_study from '$lib/assets/irasutoya/slump_good_man_study.png';
	import study_night_boy from '$lib/assets/irasutoya/study_night_boy.png';
	import study_chienetsu_boy from '$lib/assets/irasutoya/study_chienetsu_boy.png';

	interface Props {
		numberOfAssignments: number;
		onStartReview: () => void;
	}

	const { numberOfAssignments, onStartReview }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-center justify-center">
	{#if numberOfAssignments < 10}
		<img class="size-60" src={slump_good_man_study} alt="Man working effortlessly" />
		{#if numberOfAssignments === 1}
			<p class="text-lg">You've got just a single review.</p>
		{:else}
			<p class="text-lg">You've only got <b>{numberOfAssignments}</b> reviews.</p>
		{/if}
	{:else if numberOfAssignments < 99}
		<img class="size-60" src={study_night_boy} alt="Boy studying hard" />
		<p class="text-lg">You've got <b>{numberOfAssignments}</b> reviews.</p>
	{:else}
		<img class="size-60" src={study_chienetsu_boy} alt="Boy overwhelmed by work" />
		<p class="text-lg">Damn! You've got <b>{numberOfAssignments}</b> reviews.</p>
	{/if}
</div>

<Button class="flex h-20" onclick={onStartReview}>Start reviewing!</Button>
