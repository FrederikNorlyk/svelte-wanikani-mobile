<script lang="ts">
	import business_group_happy from '$lib/assets/irasutoya/business_group_happy.png';
	import Illustration from '$lib/components/Illustration.svelte';
	import { onMount } from 'svelte';
	import Centered from '$lib/components/Centered.svelte';
	import ConfettiCannon from '$lib/ui/confettiCannon';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		onContinue: () => void;
	}

	const { onContinue }: Props = $props();

	const level = (await UserRepository.getUser()).level;
	const confettiCannon = new ConfettiCannon();

	onMount(() => {
		confettiCannon.fire();
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
	buttonColor="red"
	onclick={() => {
		confettiCannon.stop();
		onContinue();
	}}
	size="medium"
	>Continue
</Button>
