<script lang="ts">
	import BellPlus from '@lucide/svelte/icons/bell-plus';
	import LogOutButton from '$lib/components/LogOutButton.svelte';
	import {
		Drawer,
		DrawerContent,
		DrawerDescription,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle
	} from '$lib/shadcn/components/ui/drawer';
	import SettingsRepository, {
		AUDIO_CHOICES,
		type Settings
	} from '$lib/repository/local-storage/settingsRepository';
	import {
		Field,
		FieldGroup,
		FieldLabel,
		FieldLegend,
		FieldSet,
		FieldSeparator,
		FieldDescription,
		FieldError
	} from '$lib/shadcn/components/ui/field';
	import {
		ToggleGroup,
		ToggleGroupItem
	} from '$lib/shadcn/components/ui/toggle-group';
	import { Switch } from '$lib/shadcn/components/ui/switch';
	import { Label } from '$lib/shadcn/components/ui/label';
	import Button from '$lib/components/Button.svelte';
	import * as AssignmentService from '$lib/services/assignmentService';

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = $bindable(false) }: Props = $props();

	const settings = $state<Settings>(SettingsRepository.get());
	let notificationPermission = $state(Notification.permission);

	$effect(() => {
		SettingsRepository.set(settings);
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

<Drawer bind:open={isOpen}>
	<DrawerContent>
		<div class="mx-auto w-full max-w-sm overflow-scroll">
			<DrawerHeader>
				<DrawerTitle>Settings</DrawerTitle>
				<DrawerDescription>Customize your experience.</DrawerDescription>
			</DrawerHeader>

			<div class="p-4">
				<FieldSet>
					<FieldLegend>Audio</FieldLegend>
					<div class="flex items-center space-x-2">
						<Switch id="autoplay" bind:checked={settings.playAudio} />
						<Label for="autoplay">Play pronunciation audio</Label>
					</div>
					<FieldGroup>
						<Field>
							<FieldLabel for="name">Voice</FieldLabel>
							<FieldDescription>Select your preferred voice</FieldDescription>
							<ToggleGroup
								disabled={!settings.playAudio}
								type="single"
								variant="outline"
								bind:value={settings.preferredAudio}
							>
								{#each AUDIO_CHOICES as audioChoice (audioChoice)}
									<ToggleGroupItem value={audioChoice}>
										{audioChoice}
									</ToggleGroupItem>
								{/each}
							</ToggleGroup>
						</Field>
					</FieldGroup>
				</FieldSet>

				{#if notificationPermission !== 'granted'}
					<FieldSeparator class="my-2" />

					<FieldSet>
						<FieldLegend>Notifications</FieldLegend>
						<FieldDescription
							>Receive notifications when new reviews are ready
						</FieldDescription>

						{#if notificationPermission === 'default'}
							<Button onclick={subscribeToPushNotifications}
								>Subscribe
								<BellPlus />
							</Button>
						{:else}
							<FieldError
								>Notifications have been disabled. To enable them go to your
								device's settings</FieldError
							>
						{/if}
					</FieldSet>

					<FieldSeparator class="my-2" />
				{/if}
			</div>
			<DrawerFooter>
				<LogOutButton />
			</DrawerFooter>
		</div>
	</DrawerContent>
</Drawer>
