<script lang="ts">
	import business_group_happy from '$lib/assets/irasutoya/business_group_happy.png';
	import IllustrationCard from '$lib/components/IllustrationCard.svelte';
	import { onMount } from 'svelte';
	import Centered from '$lib/components/Centered.svelte';
	import ConfettiCannon from '$lib/ui/confettiCannon';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import Button from '$lib/components/button/Button.svelte';

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
	<IllustrationCard
		alt="Three office workers cheering"
		src={business_group_happy}
	>
		<p>レベルアップ、おめでとう！</p>
		<p>レベル{level}になりました！</p>
	</IllustrationCard>
</Centered>

<Button
	class="flex h-30"
	buttonColor="red"
	onclick={() => {
		confettiCannon.stop();
		onContinue();
	}}
	size="medium"
	>Continue
</Button>
