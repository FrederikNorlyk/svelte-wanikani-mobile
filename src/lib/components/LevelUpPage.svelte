<script lang="ts">
	import business_group_happy from '$lib/assets/irasutoya/business_group_happy.png';
	import Illustration from '$lib/components/Illustration.svelte';
	import { onMount } from 'svelte';
	import Centered from '$lib/components/Centered.svelte';
	import ConfettiCannon from '$lib/ui/confettiCannon';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import { uiState } from '$lib/state/uiState.svelte';

	interface Props {
		onContinue: () => void;
	}

	const { onContinue }: Props = $props();

	const level = (await UserRepository.getUser()).level;
	const confettiCannon = new ConfettiCannon();

	onMount(() => {
		confettiCannon.fire();

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

<Centered>
	<Illustration
		alt="Three office workers cheering"
		src={business_group_happy}
	/>
	<p>レベルアップ、おめでとう！</p>
	<p>レベル{level}になりました！</p>
</Centered>

<Button
	class="flex h-20"
	keyboardShortcut={{
		handler: (e) => e.code === 'Space',
		hintElement: spacebarShortcut
	}}
	onclick={() => {
		confettiCannon.stop();
		onContinue();
	}}
	>Continue
</Button>

{#snippet spacebarShortcut()}
	<Kbd>Space</Kbd>
{/snippet}
