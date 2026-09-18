<script lang="ts">
	import BellPlus from '@lucide/svelte/icons/bell-plus';
	import LogOutButton from '$lib/components/LogOutButton.svelte';
	import { Drawer } from 'vaul-svelte';
	import SettingsRepository, {
		AUDIO_CHOICES,
		type Settings
	} from '$lib/repository/local-storage/settingsRepository';
	import * as AssignmentService from '$lib/services/assignmentService';
	import AppMetadataRepository from '$lib/repository/local-storage/appMetadataRepository';
	import NotificationBadge from '$lib/components/NotificationBadge.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		isOpen: boolean;
		hasSeenNotificationSubscribeButton: boolean;
	}

	let {
		isOpen = $bindable(false),
		hasSeenNotificationSubscribeButton = $bindable()
	}: Props = $props();

	const settings = $state<Settings>(SettingsRepository.get());
	let notificationPermission = $state(Notification.permission);
	let hasBeenOpen = $state(isOpen);

	$effect(() => {
		SettingsRepository.set(settings);
	});

	$effect(() => {
		if (isOpen) {
			hasBeenOpen = true;
		} else if (hasBeenOpen && !hasSeenNotificationSubscribeButton) {
			// The drawer is instantiated as closed, so we only mark this when closing the drawer after opening it
			AppMetadataRepository.setHasSeenNotificationSubscribeButton(true);
			hasSeenNotificationSubscribeButton = true;
		}
	});

	async function subscribeToPushNotifications() {
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			return;
		}

		notificationPermission = await Notification.requestPermission();

		if (notificationPermission === 'granted') {
			// As a side effect, this updates the "next push notification date"
			void AssignmentService.refresh('shuffled');
		}
	}
</script>

<Drawer.Root shouldScaleBackground bind:open={isOpen}>
	<Drawer.Portal>
		<Drawer.Overlay class="settings-overlay" />
		<Drawer.Content class="settings-drawer">
			<div class="handle" aria-hidden="true"></div>
			<div class="settings-body">
				<header>
					<Drawer.Title class="settings-title">Settings</Drawer.Title>
					<Drawer.Description class="settings-description"
						>Customize your experience.</Drawer.Description
					>
				</header>

				<fieldset>
					<legend>Audio</legend>
					<label>
						<input type="checkbox" bind:checked={settings.playAudio} />
						Play pronunciation audio
					</label>
					<fieldset
						aria-describedby="voice-description"
						disabled={!settings.playAudio}
					>
						<legend>Voice</legend>
						<p id="voice-description">Select your preferred voice</p>
						<div>
							{#each AUDIO_CHOICES as audioChoice (audioChoice)}
								<label>
									<input
										name="preferred-audio"
										type="radio"
										value={audioChoice}
										bind:group={settings.preferredAudio}
									/>
									<span>{audioChoice}</span>
								</label>
							{/each}
						</div>
					</fieldset>
				</fieldset>

				{#if notificationPermission !== 'granted'}
					<section aria-labelledby="notifications-title">
						<div class="flex gap-1">
							<h2 id="notifications-title">Notifications</h2>
							{#if !hasSeenNotificationSubscribeButton}
								<NotificationBadge class="h-4 w-4" />
							{/if}
						</div>
						<p>Receive notifications when new reviews are ready</p>
						{#if notificationPermission === 'default'}
							<Button
								buttonColor="red"
								onclick={subscribeToPushNotifications}
								size="small"
								type="button"
							>
								Subscribe <BellPlus aria-hidden="true" />
							</Button>
						{:else}
							<p>
								Notifications have been disabled. To enable them go to your
								device's settings
							</p>
						{/if}
					</section>
				{/if}

				<section aria-labelledby="logout-title">
					<h2 id="logout-title">Log out</h2>
					<p>This will reset all of your practice progress.</p>
					<LogOutButton />
				</section>
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>

<style>
	@reference '../../routes/layout.css';

	:global(.settings-overlay) {
		@apply fixed inset-0 z-50 bg-black/50;
	}

	:global(.settings-drawer) {
		@apply fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-foreground/20 bg-background text-foreground;
	}

	.handle {
		@apply mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/25;
	}

	.settings-body {
		@apply mx-auto w-full max-w-md overflow-y-auto overscroll-contain px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))];
	}

	header {
		@apply mb-6;
	}

	header :global(.settings-title) {
		@apply text-2xl font-semibold;
	}

	header :global(.settings-description) {
		@apply mt-1 opacity-75;
	}

	.settings-body > fieldset {
		@apply space-y-4;
	}

	.settings-body > fieldset > legend,
	h2 {
		@apply text-lg font-semibold;
	}

	.settings-body > fieldset > legend {
		@apply mb-3;
	}

	fieldset > label {
		@apply flex min-h-11 cursor-pointer items-center gap-3;
	}

	input[type='checkbox'] {
		@apply size-5 accent-foreground;
	}

	fieldset:disabled {
		@apply opacity-50;
	}

	fieldset fieldset legend {
		@apply font-medium;
	}

	p {
		@apply text-sm;
	}

	fieldset p {
		@apply mt-1 mb-3 opacity-75;
	}

	fieldset > div {
		@apply flex gap-2;
	}

	fieldset > div > label {
		@apply relative flex-1;
	}

	input[type='radio'] {
		@apply absolute size-full opacity-0;
	}

	input[type='radio']:enabled {
		@apply cursor-pointer;
	}

	input + span {
		@apply flex min-h-11 items-center justify-center rounded-xl border border-foreground/30 p-2;
	}

	input:checked + span {
		@apply bg-foreground text-background;
	}

	input:focus-visible + span {
		@apply outline-2 outline-offset-3 outline-foreground;
	}

	section {
		@apply mt-6 space-y-3 border-t border-foreground/20 pt-5;
	}

	section > h2 + p {
		@apply opacity-75;
	}

	section > :global(button) {
		@apply w-full;
	}
</style>
