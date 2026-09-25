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
	import Button from '$lib/components/button/Button.svelte';
	import { supportsPushNotifications } from '$lib/util/notificationUtil';

	interface Props {
		isOpen: boolean;
		hasSeenNotificationSubscribeButton: boolean;
	}

	let {
		isOpen = $bindable(false),
		hasSeenNotificationSubscribeButton = $bindable()
	}: Props = $props();

	const settings = $state<Settings>(SettingsRepository.get());
	let notificationPermission = $state<NotificationPermission | 'unsupported'>(
		supportsPushNotifications() ? Notification.permission : 'unsupported'
	);
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
		if (!supportsPushNotifications()) {
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
		<Drawer.Overlay class="fixed inset-0 z-50 bg-black/50" />
		<Drawer.Content
			class="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-foreground/20 bg-background text-foreground"
		>
			<div
				class="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/25"
				aria-hidden="true"
			></div>
			<div
				class="mx-auto w-full max-w-md overflow-y-auto overscroll-contain px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
			>
				<header class="mb-6">
					<Drawer.Title class="text-2xl font-semibold">Settings</Drawer.Title>
					<Drawer.Description class="mt-1 opacity-75"
						>Customize your experience.</Drawer.Description
					>
				</header>

				<fieldset class="space-y-4">
					<legend class="mb-3 text-lg font-semibold">Audio</legend>
					<label class="flex min-h-11 cursor-pointer items-center gap-3">
						<input
							class="size-5 accent-foreground"
							type="checkbox"
							bind:checked={settings.playAudio}
						/>
						Play pronunciation audio
					</label>
					<fieldset
						class="disabled:opacity-50"
						aria-describedby="voice-description"
						disabled={!settings.playAudio}
					>
						<legend class="font-medium">Voice</legend>
						<p id="voice-description" class="mt-1 mb-3 text-sm opacity-75">
							Select your preferred voice
						</p>
						<div class="flex gap-2">
							{#each AUDIO_CHOICES as audioChoice (audioChoice)}
								<label class="relative flex-1">
									<input
										name="preferred-audio"
										class="peer absolute size-full opacity-0 enabled:cursor-pointer"
										type="radio"
										value={audioChoice}
										bind:group={settings.preferredAudio}
									/>
									<span
										class="flex min-h-11 items-center justify-center rounded-xl border border-foreground/30 p-2 peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-foreground"
										>{audioChoice}</span
									>
								</label>
							{/each}
						</div>
					</fieldset>
				</fieldset>

				{#if notificationPermission !== 'granted'}
					<section
						class="mt-6 space-y-3 border-t border-foreground/20 pt-5 [&>button]:w-full"
						aria-labelledby="notifications-title"
					>
						<div class="flex gap-1">
							<h2 id="notifications-title" class="text-lg font-semibold">
								Notifications
							</h2>
							{#if notificationPermission !== 'unsupported' && !hasSeenNotificationSubscribeButton}
								<NotificationBadge class="h-4 w-4" />
							{/if}
						</div>
						<p class="text-sm">
							Receive notifications when new reviews are ready
						</p>
						{#if notificationPermission === 'unsupported'}
							<p class="text-sm">
								Review notifications aren't available in this browser. On iPhone
								or iPad, add WaniKani Mobile to your Home Screen and open it
								from there.
							</p>
						{:else if notificationPermission === 'default'}
							<Button
								buttonColor="red"
								onclick={subscribeToPushNotifications}
								size="small"
								type="button"
							>
								Subscribe <BellPlus aria-hidden="true" />
							</Button>
						{:else}
							<p class="text-sm">
								Notifications have been disabled. To enable them go to your
								device's settings
							</p>
						{/if}
					</section>
				{/if}

				<section
					class="mt-6 space-y-3 border-t border-foreground/20 pt-5 [&>button]:w-full"
					aria-labelledby="logout-title"
				>
					<h2 id="logout-title" class="text-lg font-semibold">Log out</h2>
					<p class="text-sm opacity-75">
						This will reset all of your practice progress.
					</p>
					<LogOutButton />
				</section>
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
