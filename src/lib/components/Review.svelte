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
	<h1 class="rounded-lg border border-border bg-fuchsia-600 p-6 text-center text-4xl text-white">
		{subject.characters ?? 'No characters'}
	</h1>

	<div class="flex-1 space-y-2">
		{#if isShowingAnswer}
			<div>
				<p class="text-2xl">Meaning</p>
				<p class="text-lg">{meaning?.meaning ?? 'No primary meaning found'}</p>
			</div>
			<div>
				<p class="text-2xl">Reading</p>
				<p class="text-lg">{reading?.reading ?? 'No primary reading found'}</p>
			</div>
		{/if}
	</div>

	<div class="flex space-x-2">
		{#if isShowingAnswer}
			<Button class="h-20 flex-1" size="lg" variant="success" onclick={onCorrectAnswer}>Yes</Button>
			<Button class="h-20 flex-1" size="lg" variant="destructive" onclick={onWrongAnswer}
				>No
			</Button>
		{:else}
			<Button class="h-20 flex-1" onclick={() => (isShowingAnswer = true)}>Show answer</Button>
		{/if}
	</div>
</div>
