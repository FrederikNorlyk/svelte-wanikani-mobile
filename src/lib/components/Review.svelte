<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { Button } from '$lib/shadcn/components/ui/button';

	interface Props {
		subject: Subject;
		onCorrectAnswer: () => void;
		onWrongAnswer: () => void;
	}

	const { subject, onCorrectAnswer, onWrongAnswer }: Props = $props();

	let isShowingAnswer = $state(false);

	$effect(() => {
		void subject; // Track changes
		isShowingAnswer = false;
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
			<Button class="h-20 flex-1" onclick={() => (isShowingAnswer = true)}>Show answer</Button>
		{/if}
	</div>
</div>

{#snippet answerBlock(label: string, primaryAnswer: string, secondaryAnswers: string[])}
	<div class="answer">
		<p class="answer__label">{label}</p>
		<b class="answer__text answer__text--primary">{primaryAnswer}</b>
		{#if secondaryAnswers.length > 0}
			<div class="answer__secondary-block flex gap-2">
				{#each secondaryAnswers as answer (answer)}
					<p class="answer__text answer__text--secondary">{answer}</p>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}
