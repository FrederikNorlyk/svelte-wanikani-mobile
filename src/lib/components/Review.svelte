<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { Progress } from '$lib/shadcn/components/ui/progress';

	interface Props {
		subject: Subject;
		progress: number;
		onCorrectAnswer: () => void;
		onWrongAnswer: () => void;
	}

	const { subject, progress, onCorrectAnswer, onWrongAnswer }: Props = $props();

	let isShowingAnswer = $state(false);
	let audio: HTMLAudioElement | undefined = $state(undefined);

	async function loadAudio() {
		audio = undefined;

		if (subject.audio.length == 0) {
			return;
		}

		const url = subject.audio[Math.floor(Math.random() * subject.audio.length)]?.url;
		const response = await fetch(url);
		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);

		audio = new Audio(objectUrl);

		audio.onended = () => {
			URL.revokeObjectURL(objectUrl);
		};
	}

	async function playAudio() {
		try {
			await audio?.play();
		} catch (e) {
			toast.error('Could not play audio: ' + e);
		}
	}

	$effect(() => {
		void subject; // Track changes
		isShowingAnswer = false;
		void loadAudio();
	});

	const primaryMeaning = $derived(subject.meanings.find((meaning) => meaning.primary)?.meaning);
	const primaryReading = $derived(subject.readings?.find((reading) => reading.primary)?.reading);

	const secondaryMeanings = $derived(
		subject.meanings
			.filter(
				(meaning) =>
					!meaning.primary && meaning.meaning.toLowerCase() !== primaryMeaning?.toLowerCase()
			)
			.map((meaning) => meaning.meaning)
	);

	const secondaryReadings = $derived(
		subject.readings
			?.filter(
				(reading) =>
					!reading.primary && reading.reading.toLowerCase() !== primaryReading?.toLowerCase()
			)
			.map((reading) => reading.reading) ?? []
	);
</script>

<div class="flex flex-1 flex-col gap-2">
	<Progress value={progress} />

	<h1
		class="character-header"
		class:character-header--vocab={subject.object === 'vocabulary' ||
			subject.object === 'kana_vocabulary'}
		class:character-header--kanji={subject.object === 'kanji'}
		class:character-header--radical={subject.object === 'radical'}
	>
		{subject.characters ?? 'No characters'}
	</h1>

	<div class="flex-1 space-y-2">
		{#if isShowingAnswer}
			{#if primaryMeaning}
				{@render answerBlock('Meanings', primaryMeaning, secondaryMeanings)}
			{/if}
			{#if primaryReading}
				{@render answerBlock('Readings', primaryReading, secondaryReadings)}
			{/if}
		{/if}
	</div>

	<div class="flex space-x-4">
		{#if isShowingAnswer}
			<Button class="h-20 flex-1" size="lg" onclick={onCorrectAnswer}>Knew it</Button>
			<Button class="h-20 flex-1" size="lg" variant="secondary" onclick={onWrongAnswer}
				>Didn't know
			</Button>
		{:else}
			<Button
				class="h-20 flex-1"
				onclick={() => {
					void playAudio();
					isShowingAnswer = true;
				}}
				>Show answer
			</Button>
		{/if}
	</div>
</div>

{#snippet answerBlock(label: string, primaryAnswer: string, secondaryAnswers: string[])}
	<div class="answer">
		<p class="answer__label">{label}</p>
		<b class="answer__text answer__text--primary">{primaryAnswer}</b>
		{#if secondaryAnswers.length > 0}
			<div>
				{#each secondaryAnswers as answer (answer)}
					<p class="answer__text answer__text--secondary">{answer}</p>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}
