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

	const meaning = $derived(subject.meanings.find((meaning) => meaning.primary));
	const reading = $derived(subject.readings?.find((reading) => reading.primary));
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
			{#if meaning}
				<div class="answer">
					<p class="answer__label">Meaning</p>
					<p class="answer__text">{meaning.meaning}</p>
				</div>
			{/if}
			{#if reading}
				<div class="answer">
					<p class="answer__label">Reading</p>
					<p class="answer__text">{reading.reading}</p>
				</div>
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
