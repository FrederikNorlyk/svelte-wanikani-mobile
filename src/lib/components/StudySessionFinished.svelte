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
	import { Progress } from '$lib/shadcn/components/ui/progress';
	import { onMount } from 'svelte';

	interface Props {
		onContinue: () => void;
	}

	const { onContinue }: Props = $props();

	const percentageCorrect = $derived(
		Math.floor(
			(studySession().numberOfCorrectAnswers * 100) /
				studySession().subjectIds.length
		)
	);

	let progress = $state(0);
	const duration = 5000;
	let rafId: number | undefined;
	let startTime = 0;

	onMount(() => {
		startTime = performance.now();

		const tick = (now: number) => {
			const elapsed = now - startTime;
			progress = Math.min((elapsed / duration) * 100, 100);

			if (elapsed < duration) {
				rafId = requestAnimationFrame(tick);
			}
		};

		rafId = requestAnimationFrame(tick);

		return () => {
			if (rafId !== undefined) {
				cancelAnimationFrame(rafId);
			}
		};
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

	{#if percentageCorrect === 100}
		<Illustration
			alt="An illustration of a male office worker in a suit, celebrating with a triumphant fist pump."
			src={pose_happy_businessman_guts}
		>
			<p>Fantastic job!</p>
		</Illustration>
	{:else if percentageCorrect >= 60}
		<Illustration
			alt="An illustration of a man relaxing comfortably in an outdoor hot spring."
			src={onsen_man}
		>
			<p>Well done!</p>
		</Illustration>
	{:else if percentageCorrect > 30}
		<Illustration
			alt="Illustration of a businessman lying on the grass, resting or sleeping."
			src={hirune_soto_businessman}
		>
			<p>All done!</p>
		</Illustration>
	{:else if percentageCorrect > 0}
		<Illustration
			alt="An illustration of a family staring with blank, emotionless expressions."
			src={ochanoma_mu_notv}
		>
			<p>Better luck next time</p>
		</Illustration>
	{:else}
		<Illustration
			alt="An illustration of a man who has experienced failure collapsing forward in despair."
			src={pose_zasetsu}
		>
			<p>Better luck next time...</p>
		</Illustration>
	{/if}
</Centered>

<Button
	class="relative w-full"
	keyboardShortcut={{
		handler: (e) => e.code === 'Space',
		hintElement: spacebarShortcut
	}}
	onclick={onContinue}
	size="lg"
>
	<Progress
		class="absolute bottom-0 rounded-t-none **:data-[slot='progress-indicator']:bg-primary-foreground"
		value={progress}
	/>
	Continue
</Button>

{#snippet spacebarShortcut()}
	<Kbd>Space</Kbd>
{/snippet}
