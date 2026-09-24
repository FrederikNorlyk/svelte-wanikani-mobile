<script lang="ts">
	import IllustrationLayout from '$lib/components/layouts/IllustrationLayout.svelte';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Settings from '@lucide/svelte/icons/settings';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import AnchorButton from '$lib/components/button/AnchorButton.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import type { NextReviewData } from '$lib/functions/assignments.remote';
	import AppMetadataRepository from '$lib/repository/local-storage/appMetadataRepository';
	import NotificationBadge from '$lib/components/NotificationBadge.svelte';
	import ReviewCard from '$lib/components/home/ReviewCard.svelte';

	interface Props {
		numberOfAssignments: number;
		numberOfLessons: number;
		nextReviewData: NextReviewData | null;
		onReviewButtonPressed: () => void;
		onPracticeButtonPressed: () => void;
	}

	const {
		numberOfAssignments,
		numberOfLessons,
		nextReviewData,
		onReviewButtonPressed,
		onPracticeButtonPressed
	}: Props = $props();

	let isSettingsOpen = $state(false);

	let hasSeenNotificationSubscribeButton = $state(
		AppMetadataRepository.get().hasSeenNotificationSubscribeButton
	);
</script>

<IllustrationLayout>
	<ReviewCard {nextReviewData} {numberOfAssignments} {onReviewButtonPressed} />

	{#snippet actions()}
		<div class="flex w-full flex-col gap-8">
			<div class="flex gap-8">
				<Button
					class="flex-1 flex-col gap-4"
					buttonColor="sand"
					iconColor="green"
					onclick={onPracticeButtonPressed}
					size="large"
				>
					<Dumbbell />
					<div class="flex-1 text-center">
						<h2>Practice</h2>
						<p class="text-sm font-normal tracking-normal">
							Review anything you've learned
						</p>
					</div>
				</Button>

				<AnchorButton
					class="flex-1 flex-col gap-4"
					buttonColor="sand"
					disabled={numberOfLessons === 0}
					href="https://wanikani.com"
					iconColor="yellow"
					size="large"
					target="_blank"
				>
					<GraduationCap />
					<div class="flex-1 text-center">
						<h2>Lessons</h2>
						<p class="text-sm font-normal tracking-normal">
							{numberOfLessons === 0
								? 'Done'
								: `${numberOfLessons} ${numberOfLessons === 1 ? 'lesson' : 'lessons'} available`}
						</p>
					</div>
				</AnchorButton>
			</div>

			<Button
				class="justify-between"
				buttonColor="sand"
				onclick={() => {
					isSettingsOpen = true;
				}}
				size="medium"
			>
				<span class="flex items-center gap-3">
					<Settings />

					<span class="flex gap-1"
						>Settings
						{#if !hasSeenNotificationSubscribeButton}
							<NotificationBadge class="mb-2 h-4 w-4" />
						{/if}
					</span>
				</span>

				<ChevronUp />
			</Button>
		</div>
	{/snippet}
</IllustrationLayout>

<SettingsDrawer
	bind:isOpen={isSettingsOpen}
	bind:hasSeenNotificationSubscribeButton
/>
