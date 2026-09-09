<script lang="ts">
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Settings from '@lucide/svelte/icons/settings';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import Button from '$lib/components/Button.svelte';
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

<div class="mx-auto flex w-full flex-1 flex-col items-center gap-8 sm:w-110">
	<div class="flex w-full flex-1 items-center">
		<ReviewCard
			{nextReviewData}
			{numberOfAssignments}
			{onReviewButtonPressed}
		/>
	</div>

	<div class="flex w-full flex-col gap-8">
		<div class="flex gap-8">
			<Button
				class="flex-1 flex-col gap-4"
				onclick={onPracticeButtonPressed}
				size="large"
				variant="secondary"
			>
				<Dumbbell />
				<div class="flex-1 text-center">
					<h2>Practice</h2>
					<p class="text-sm font-normal tracking-normal">
						Review anything you've learned
					</p>
				</div>
			</Button>

			<Button
				class="flex-1 flex-col gap-4"
				disabled={numberOfLessons === 0}
				href="https://wanikani.com"
				size="large"
				target="_blank"
				variant="secondary"
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
			</Button>
		</div>

		<Button
			class="justify-between"
			onclick={() => {
				isSettingsOpen = true;
			}}
			size="medium"
			variant="secondary"
		>
			{#if !hasSeenNotificationSubscribeButton}
				<NotificationBadge />
			{/if}
			<span class="flex items-center gap-3">
				<Settings />
				<span>Settings</span>
			</span>
			<ChevronUp />
		</Button>
	</div>
</div>

<SettingsDrawer
	bind:isOpen={isSettingsOpen}
	bind:hasSeenNotificationSubscribeButton
/>
