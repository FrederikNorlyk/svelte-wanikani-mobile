<script lang="ts">
	import Centered from '$lib/components/Centered.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import pose_happy_businessman_guts from '$lib/assets/irasutoya/pose_happy_businessman_guts.png';
	import pose_zasetsu from '$lib/assets/irasutoya/pose_zasetsu.png';
	import onsen_man from '$lib/assets/irasutoya/onsen_man.png';
	import ochanoma_mu_notv from '$lib/assets/irasutoya/ochanoma_mu_notv.png';
	import hirune_soto_businessman from '$lib/assets/irasutoya/hirune_soto_businessman.png';
	import { studySession } from '$lib/state/studySession.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';

	interface Props {
		onContinue: () => void;
	}

	interface IllustrationProps {
		alt: string;
		src: string;
		paragraph: string;
	}

	const { onContinue }: Props = $props();

	const percentageCorrect = $derived(
		Math.floor(
			(studySession().numberOfCorrectAnswers * 100) /
				studySession().subjectIds.length
		)
	);

	const illustration: IllustrationProps = $derived.by(() => {
		if (percentageCorrect === 100) {
			return {
				alt: 'An illustration of a male office worker in a suit, celebrating with a triumphant fist pump.',
				src: pose_happy_businessman_guts,
				paragraph: 'Fantastic job!'
			};
		} else if (percentageCorrect >= 80) {
			return {
				alt: 'An illustration of a man relaxing comfortably in an outdoor hot spring.',
				src: onsen_man,
				paragraph: 'Well done!'
			};
		} else if (percentageCorrect > 30) {
			return {
				alt: 'Illustration of a businessman lying on the grass, resting or sleeping.',
				src: hirune_soto_businessman,
				paragraph: 'All done!'
			};
		} else if (percentageCorrect > 0) {
			return {
				alt: 'An illustration of a family staring with blank, emotionless expressions.',
				src: ochanoma_mu_notv,
				paragraph: ''
			};
		} else {
			return {
				alt: 'An illustration of a man who has experienced failure collapsing forward in despair.',
				src: pose_zasetsu,
				paragraph: 'Better luck next time...'
			};
		}
	});
</script>

<Centered>
	<p class="text-lg">
		{#if percentageCorrect === 0}
			You had no correct answers!
		{:else if percentageCorrect === 100}
			You had no wrong answers!
		{:else}
			You answered {percentageCorrect}% correctly
		{/if}
	</p>

	<Illustration alt={illustration.alt} src={illustration.src}>
		<p>{illustration.paragraph}</p>
	</Illustration>
</Centered>

<Button
	class="relative w-full overflow-hidden"
	keyboardShortcut={{
		handler: (e) => e.code === 'Space',
		hintElement: spacebarShortcut
	}}
	onclick={onContinue}
>
	<div
		class="progress-bar absolute inset-x-0 bottom-0 h-full origin-left bg-primary-foreground/20"
		aria-hidden="true"
	></div>
	Continue
</Button>

{#snippet spacebarShortcut()}
	<Kbd>Space</Kbd>
{/snippet}

<style>
	.progress-bar {
		animation: progress-fill 5s linear forwards;
	}

	@keyframes progress-fill {
		from {
			transform: scaleX(0);
		}

		to {
			transform: scaleX(1);
		}
	}
</style>
