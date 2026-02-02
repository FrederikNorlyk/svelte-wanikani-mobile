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
	} from '$lib/repository/settingsRepository';
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

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = $bindable(false) }: Props = $props();

	const settings = $state<Settings>(SettingsRepository.get());

	$effect(() => {
		SettingsRepository.set(settings);
	});
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
						<Label for="autoplay">Play audio during reviews</Label>
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
			</div>
			<DrawerFooter>
				<LogOutButton />
			</DrawerFooter>
		</div>
	</DrawerContent>
</Drawer>
