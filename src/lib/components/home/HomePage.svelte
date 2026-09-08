<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Dumbbell from '@lucide/svelte/icons/dumbbell';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Settings from '@lucide/svelte/icons/settings';
	import SettingsDrawer from '$lib/components/SettingsDrawer.svelte';
	import { onMount } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import { uiState } from '$lib/state/uiState.svelte.js';
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

<div class="flex min-h-0 flex-1 flex-col items-center justify-center">
	<ReviewCard {nextReviewData} {numberOfAssignments} {onReviewButtonPressed} />
</div>

<div class="flex w-full flex-col gap-4">
	<div class="flex gap-4">
		<Button
			class="min-h-40 flex-1 flex-col gap-2 px-4 py-6 sm:px-6"
			keyboardShortcut={{
				handler: (e) => e.key === 'p',
				hintElement: practiceShortcut
			}}
			onclick={onPracticeButtonPressed}
			variant="secondary"
		>
			<Dumbbell />
			<h2>Practice</h2>
			<p class="text-center text-sm font-normal tracking-normal">
				Review anything you've learned
			</p>
		</Button>

		<Button
			class="min-h-40 flex-1 flex-col gap-2 px-4 py-6 sm:px-6"
			disabled={numberOfLessons === 0}
			href="https://wanikani.com"
			target="_blank"
			variant="secondary"
		>
			<GraduationCap />
			<h2>Lessons</h2>
			<p class="text-center text-sm font-normal tracking-normal">
				{numberOfLessons === 0
					? 'Done'
					: `${numberOfLessons} ${numberOfLessons === 1 ? 'lesson' : 'lessons'} available`}
			</p>
		</Button>
	</div>

	<Button
		class="relative w-full justify-between px-6 py-4"
		keyboardShortcut={{
			handler: (e) => e.key === 's',
			hintElement: settingsShortcut
		}}
		onclick={() => {
			isSettingsOpen = true;
		}}
		variant="secondary"
	>
		{#if !hasSeenNotificationSubscribeButton}
			<NotificationBadge />
		{/if}
		<span class="flex items-center gap-3">
			<Settings />
			<span>Settings</span>
		</span>
		<ChevronRight />
	</Button>
</div>

<SettingsDrawer
	bind:isOpen={isSettingsOpen}
	bind:hasSeenNotificationSubscribeButton
/>

{#snippet practiceShortcut()}
	<Kbd>P</Kbd>
{/snippet}

{#snippet settingsShortcut()}
	<Kbd>S</Kbd>
{/snippet}
