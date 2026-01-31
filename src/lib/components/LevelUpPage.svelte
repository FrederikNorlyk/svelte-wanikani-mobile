<script lang="ts">
	import business_group_happy from '$lib/assets/irasutoya/business_group_happy.png';
	import Illustration from '$lib/components/Illustration.svelte';
	import { onMount } from 'svelte';
	import Centered from '$lib/components/Centered.svelte';
	import { Button } from '$lib/shadcn/components/ui/button';
	import ConfettiCannon from '$lib/ui/confettiCannon';

	interface Props {
		level: number;
		onContinue: () => void;
	}

	const { level, onContinue }: Props = $props();

	const confettiCannon = new ConfettiCannon();

	onMount(() => {
		confettiCannon.fire();
	});
</script>

<Centered>
	<Illustration src={business_group_happy} alt="Three office workers cheering">
		レベルアップ、おめでとう！<br />レベル{level}になりました！
	</Illustration>
</Centered>

<Button
	class="flex h-20"
	onclick={() => {
		confettiCannon.stop();
		onContinue();
	}}
	>Continue
</Button>
