<script lang="ts">
	import blackCatNo from '$lib/assets/mascots/black-cat-no.png';
	import blackCatYes from '$lib/assets/mascots/black-cat-yes.png';
	import darumaNo from '$lib/assets/mascots/daruma-no.png';
	import darumaYes from '$lib/assets/mascots/daruma-yes.png';
	import dogNo from '$lib/assets/mascots/dog-no.png';
	import dogYes from '$lib/assets/mascots/dog-yes.png';
	import foxNo from '$lib/assets/mascots/fox-no.png';
	import foxYes from '$lib/assets/mascots/fox-yes.png';
	import luckyCatNo from '$lib/assets/mascots/lucky-cat-no.png';
	import luckyCatYes from '$lib/assets/mascots/lucky-cat-yes.png';
	import tanukiNo from '$lib/assets/mascots/tanuki-no.png';
	import tanukiYes from '$lib/assets/mascots/tanuki-yes.png';
	import Button from '$lib/components/Button.svelte';
	import {
		studySession,
		type MascotPair
	} from '$lib/state/studySession.svelte';

	interface Props {
		type: 'correct' | 'wrong';
		onclick: () => void;
	}

	const { type, onclick }: Props = $props();

	const mascots: Record<MascotPair, Record<Props['type'], string>> = {
		'black-cat': { correct: blackCatYes, wrong: blackCatNo },
		daruma: { correct: darumaYes, wrong: darumaNo },
		dog: { correct: dogYes, wrong: dogNo },
		fox: { correct: foxYes, wrong: foxNo },
		'lucky-cat': { correct: luckyCatYes, wrong: luckyCatNo },
		tanuki: { correct: tanukiYes, wrong: tanukiNo }
	};

	const mascot = $derived(mascots[studySession().mascotPair][type]);
</script>

<div class="flex flex-1 flex-col justify-end">
	<img
		class="pointer-events-none z-10 mx-auto -mb-2 h-20"
		alt={mascot}
		aria-hidden="true"
		src={mascot}
	/>
	<Button class="h-30 w-full" buttonColor="sand" {onclick} size="medium">
		{#if type === 'correct'}
			Knew it
		{:else}
			Didn't know
		{/if}
	</Button>
</div>
