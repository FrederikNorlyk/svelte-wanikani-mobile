<script lang="ts">
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
		FieldSet
	} from '$lib/shadcn/components/ui/field';
	import { FieldDescription } from '$lib/shadcn/components/ui/field/index';
	import {
		ToggleGroup,
		ToggleGroupItem
	} from '$lib/shadcn/components/ui/toggle-group';
	import { Switch } from '$lib/shadcn/components/ui/switch';
	import { Label } from '$lib/shadcn/components/ui/label';
	import Button from '$lib/components/Button.svelte';
	import { registerPushNotification } from '$lib/functions/notifications.remote';
	import { PUBLIC_VAPID } from '$env/static/public';
	import { base64UrlToUint8Array } from '$lib/util/base64';

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = $bindable(false) }: Props = $props();

	const settings = $state<Settings>(SettingsRepository.get());

	$effect(() => {
		SettingsRepository.set(settings);
	});

	async function subscribeNotifications() {
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const permission = await Notification.requestPermission();

		if (permission !== 'granted') {
			return;
		}

		let subscription = await registration.pushManager.getSubscription();

		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: base64UrlToUint8Array(PUBLIC_VAPID)
			});
		}

		await registerPushNotification({
			endpoint: subscription.endpoint,
			subscription: JSON.stringify(subscription),
			nextReviewAt: new Date()
		});
	}
</script>

<Drawer bind:open={isOpen}>
	<DrawerContent>
		<div class="mx-auto w-full max-w-sm">
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

				<Button onclick={subscribeNotifications}>Subscribe</Button>
			</div>
			<DrawerFooter>
				<LogOutButton />
			</DrawerFooter>
		</div>
	</DrawerContent>
</Drawer>
