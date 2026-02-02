<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { Progress } from '$lib/shadcn/components/ui/progress';
	// noinspection ES6UnusedImports
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import SettingsRepository from '$lib/repository/settingsRepository';
	import AudioUtil from '$lib/util/audioUtil';
	import CharacterHeader from '$lib/components/CharacterHeader.svelte';

	interface Props {
		subject: Subject;
		progress: number;
		onCorrectAnswer: () => void;
		onWrongAnswer: () => void;
	}

	const { subject, progress, onCorrectAnswer, onWrongAnswer }: Props = $props();

	const settings = SettingsRepository.get();

	let audioElement: HTMLAudioElement | undefined = $state(undefined);
	let isShowingAnswer = $state(false);

	const primaryMeaning = $derived(subject.primaryMeaning);
	const primaryReading = $derived(subject.primaryReading);
	const secondaryMeanings = $derived(subject.secondaryMeanings);
	const secondaryReadings = $derived(subject.secondaryReadings);

	$effect(() => {
		void subject; // Track changes
		isShowingAnswer = false;

		if (settings.playAudio) {
			AudioUtil.createAudioElement(subject, settings.preferredAudio).then(
				(audio) => (audioElement = audio)
			);
		}
	});
</script>

<div class="flex flex-1 flex-col gap-2">
	<Progress value={progress} />

	<CharacterHeader type={subject.type}>
		{subject.characters ?? 'No characters'}
	</CharacterHeader>

	<div class="flex-1 space-y-2">
		{#if isShowingAnswer}
			{#if primaryMeaning}
				{@render answerBlock(
					'Meanings',
					primaryMeaning,
					secondaryMeanings,
					'meaning'
				)}
			{/if}
			{#if primaryReading}
				{@render answerBlock(
					'Readings',
					primaryReading,
					secondaryReadings,
					'reading'
				)}
			{/if}
		{/if}
	</div>

	<div class="flex space-x-4">
		{#if isShowingAnswer}
			<Button class="h-20 flex-1" onclick={onCorrectAnswer}>Knew it</Button>
			<Button class="h-20 flex-1" onclick={onWrongAnswer} variant="secondary"
				>Didn't know
			</Button>
		{:else}
			<Button
				class="h-20 flex-1"
				onclick={() => {
					void audioElement?.play();
					isShowingAnswer = true;
				}}
				>Show answer
			</Button>
		{/if}
	</div>
</div>

{#snippet answerBlock(
	label: string,
	primaryAnswer: string,
	secondaryAnswers: string[],
	anchor: string
)}
	<a
		class="answer"
		href={`${subject.documentUrl}#${anchor}`}
		rel="external"
		target="_blank"
	>
		<ExternalLink class="absolute right-4 size-4 text-muted-foreground" />
		<p class="answer__label">{label}</p>
		<b class="answer__text answer__text--primary">{primaryAnswer}</b>
		{#if secondaryAnswers.length > 0}
			<div>
				{#each secondaryAnswers as answer (answer)}
					<p class="answer__text answer__text--secondary">{answer}</p>
				{/each}
			</div>
		{/if}
	</a>
{/snippet}
