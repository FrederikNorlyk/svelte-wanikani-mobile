<script lang="ts">
	import Settings from '@lucide/svelte/icons/settings';
	import {
		ButtonGroup,
		ButtonGroupSeparator
	} from '$lib/shadcn/components/ui/button-group';
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

<div class="flex flex-1 flex-col items-center justify-center">
	<ReviewCard {nextReviewData} {numberOfAssignments} {onReviewButtonPressed} />
</div>

<div class="flex w-full justify-end gap-4">
	<Button
		class="flex-1"
		keyboardShortcut={{
			handler: (e) => e.key === 'p',
			hintElement: practiceShortcut
		}}
		onclick={onPracticeButtonPressed}
	>
		Practice
	</Button>

	<Button
		class="relative"
		keyboardShortcut={{
			handler: (e) => e.key === 's',
			hintElement: settingsShortcut
		}}
		onclick={() => {
			isSettingsOpen = true;
		}}
	>
		{#if !hasSeenNotificationSubscribeButton}
			<NotificationBadge />
		{/if}
		<Settings class="size-5" />
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
