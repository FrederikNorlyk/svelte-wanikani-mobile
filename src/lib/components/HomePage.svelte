<script lang="ts">
	import slump_good_man_study from '$lib/assets/irasutoya/slump_good_man_study.png';
	import study_night_boy from '$lib/assets/irasutoya/study_night_boy.png';
	import study_chienetsu_boy from '$lib/assets/irasutoya/study_chienetsu_boy.png';
	import kokage_tree_necchusyou from '$lib/assets/irasutoya/kokage_tree_necchusyou.png';
	import Illustration from '$lib/components/Illustration.svelte';
	import Settings from '@lucide/svelte/icons/settings';
	import {
		ButtonGroup,
		ButtonGroupSeparator
	} from '$lib/shadcn/components/ui/button-group';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import { uiState } from '$lib/state/uiState.svelte';
	import type { NextReviewData } from '$lib/functions/assignments.remote';

	interface Props {
		numberOfAssignments: number;
		nextReviewData: NextReviewData | null;
		onReviewButtonPressed: () => void;
		onPracticeButtonPressed: () => void;
	}

	const {
		numberOfAssignments,
		nextReviewData,
		onReviewButtonPressed,
		onPracticeButtonPressed
	}: Props = $props();

	let isSettingsOpen = $state(false);

	onMount(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === '?') {
				uiState.isShowingKeyboardShortcuts =
					!uiState.isShowingKeyboardShortcuts;
			}
		};

		window.addEventListener('keyup', onKeyUp, { passive: true });

		return () => window.removeEventListener('keyup', onKeyUp);
	});
</script>

<div class="flex flex-1 flex-col items-center justify-center">
	{#if numberOfAssignments === 0}
		<Illustration alt="Boy resting under a tree" src={kokage_tree_necchusyou}>
			<p>All caught up!</p>

			{#if nextReviewData}
				{@const formattedHour = new Intl.DateTimeFormat(undefined, {
					hour: 'numeric',
					minute: '2-digit'
				}).format(nextReviewData.nextReviewAt)}
				<p>
					{#if nextReviewData.numberOfReviews === 1}
						Come back at {formattedHour} for a single review.
					{:else}
						Come back at {formattedHour}
						for {nextReviewData.numberOfReviews} more reviews.
					{/if}
				</p>
			{/if}
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

<ButtonGroup class="flex w-full justify-end">
	{#if numberOfAssignments > 0}
		<Button
			class="flex-1"
			keyboardShortcut={{
				handler: (e) => e.key === 'r',
				hintElement: reviewShortcut
			}}
			onclick={onReviewButtonPressed}
			size="lg"
		>
			Review
		</Button>
		<ButtonGroupSeparator />
	{/if}

	<Button
		class="flex-1"
		keyboardShortcut={{
			handler: (e) => e.key === 'p',
			hintElement: practiceShortcut
		}}
		onclick={onPracticeButtonPressed}
		size="lg"
	>
		Practice
	</Button>

	<ButtonGroupSeparator />

	<Button
		keyboardShortcut={{
			handler: (e) => e.key === 's',
			hintElement: settingsShortcut
		}}
		onclick={() => {
			isSettingsOpen = true;
		}}
		size="icon-lg"
	>
		<Settings class="size-5" />
	</Button>
</ButtonGroup>

<SettingsDrawer bind:isOpen={isSettingsOpen} />

{#snippet reviewShortcut()}
	<Kbd>R</Kbd>
{/snippet}

{#snippet practiceShortcut()}
	<Kbd>P</Kbd>
{/snippet}

{#snippet settingsShortcut()}
	<Kbd>S</Kbd>
{/snippet}
