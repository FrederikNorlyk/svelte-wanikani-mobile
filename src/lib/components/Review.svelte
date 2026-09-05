<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { Progress } from '$lib/shadcn/components/ui/progress';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import ArrowBigLeft from '@lucide/svelte/icons/arrow-big-left';
	import ArrowBigRight from '@lucide/svelte/icons/arrow-big-right';
	import SettingsRepository from '$lib/repository/local-storage/settingsRepository';
	import AudioUtil from '$lib/util/audioUtil';
	import { onMount } from 'svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import { uiState } from '$lib/state/uiState.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from 'svelte-sonner';
	import { studySession } from '$lib/state/studySession.svelte';
	import { calculatePercentage } from '$lib/util/mathUtil';
	import SubjectCard from './SubjectCard.svelte';
	import SubjectCharacter from '$lib/components/SubjectCharacter.svelte';

	interface Props {
		subject: Subject;
		onCorrectAnswer: () => void;
		onWrongAnswer: () => void;
	}

	const { subject, onCorrectAnswer, onWrongAnswer }: Props = $props();

	const settings = SettingsRepository.get();

	let audioElement: HTMLAudioElement | undefined = $state(undefined);
	let isShowingAnswer = $state(false);

	const primaryMeaning = $derived(subject.primaryMeaning);
	const primaryReading = $derived(subject.primaryReading);
	const secondaryMeanings = $derived(subject.secondaryMeanings);
	const secondaryReadings = $derived(subject.secondaryReadings);

	const subjectType = $derived.by(() => {
		switch (subject.type) {
			case 'radical':
				return 'Radical';
			case 'kanji':
				return 'Kanji';
			case 'kana_vocabulary':
			case 'vocabulary':
				return 'Vocabulary';
		}
	});

	const progress = $derived(() => {
		const completed = studySession().index;
		const total = studySession().subjectIds.length;
		return calculatePercentage(completed, total);
	});

	$effect(() => {
		void subject; // Track changes
		isShowingAnswer = false;

		const controller = new AbortController();

		if (settings.playAudio && navigator.onLine) {
			AudioUtil.createAudioElement(subject, settings.preferredAudio, {
				signal: controller.signal
			})
				.then((audio) => {
					if (controller.signal.aborted) {
						return;
					}
					audioElement = audio;
				})
				.catch((err) => {
					if (controller.signal.aborted) {
						return;
					} else if (err instanceof DOMException && err.name === 'AbortError') {
						return;
					} else if (!navigator.onLine) {
						return;
					}
					console.error(err);
					toast.error('Failed to load audio');
				});
		}

		return () => {
			controller.abort();
			audioElement?.pause();
			audioElement = undefined;
		};
	});

	onMount(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === '?') {
				uiState.isShowingKeyboardShortcuts =
					!uiState.isShowingKeyboardShortcuts;
			} else if (isShowingAnswer && e.key === 'f') {
				window.open(subject.documentUrl, '_blank');
			}
		};

		window.addEventListener('keyup', onKeyUp, { passive: true });

		return () => window.removeEventListener('keyup', onKeyUp);
	});
</script>

<Progress value={progress()} />

<a
	class="block"
	href={isShowingAnswer ? subject.documentUrl : undefined}
	rel="external"
	target="_blank"
>
	<SubjectCard class="min-h-60 gap-3" {subject}>
		<div class="flex w-full items-center text-left text-lg font-medium">
			<span class="flex-1">{subjectType}</span>

			{#if isShowingAnswer}
				<div class="flex gap-2">
					<ExternalLink class="inline-block size-5" />

					{#if uiState.isShowingKeyboardShortcuts}
						<Kbd class="inline-block bg-secondary-foreground text-secondary"
							>f</Kbd
						>
					{/if}
				</div>
			{/if}
		</div>

		<div
			class="grid flex-1 grid-rows-[1fr_auto_1fr] items-center justify-items-center gap-2"
		>
			<div class="self-end">
				{#if isShowingAnswer && primaryReading}
					<p class="text-xl">{primaryReading}</p>
				{/if}
			</div>

			<SubjectCharacter class="text-5xl" {subject} />

			<div class="self-start">
				{#if isShowingAnswer && primaryMeaning}
					<p class="text-xl">{primaryMeaning}</p>
				{/if}
			</div>
		</div>
	</SubjectCard>
</a>

<div class="flex-1 space-y-2">
	{#if isShowingAnswer}
		{#if secondaryMeanings.length > 0}
			{@render answerBlock('Secondary meanings', secondaryMeanings)}
		{/if}
		{#if secondaryReadings.length > 0}
			{@render answerBlock('Secondary readings', secondaryReadings)}
		{/if}
	{/if}
</div>

<div class="flex space-x-4">
	{#if isShowingAnswer}
		<Button
			class="flex-1"
			keyboardShortcut={{
				handler: (e) => e.code === 'ArrowLeft' || e.key === 'h',
				hintElement: arrowLeftShortcut
			}}
			onclick={onCorrectAnswer}
			>Knew it
		</Button>
		<Button
			class="flex-1"
			keyboardShortcut={{
				handler: (e) => e.code === 'ArrowRight' || e.key === 'l',
				hintElement: arrowRightShortcut
			}}
			onclick={onWrongAnswer}
			>Didn't know
		</Button>
	{:else}
		<Button
			class="flex-1"
			keyboardShortcut={{
				handler: (e) =>
					e.code === 'Space' ||
					e.code === 'ArrowRight' ||
					e.code === 'ArrowLeft',
				hintElement: spacebarShortcut
			}}
			onclick={() => {
				void audioElement?.play();
				isShowingAnswer = true;
			}}
			>Show answer
		</Button>
	{/if}
</div>

{#snippet answerBlock(label: string, answers: string[])}
	<div class="answer-card">
		<p class="answer-card__label">{label}</p>
		<div>
			{#each answers as answer (answer)}
				<p class="answer-card__text">{answer}</p>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet arrowLeftShortcut()}
	<Kbd>
		<ArrowBigLeft />
	</Kbd>
{/snippet}

{#snippet arrowRightShortcut()}
	<Kbd class="bg-secondary-foreground text-secondary">
		<ArrowBigRight />
	</Kbd>
{/snippet}

{#snippet spacebarShortcut()}
	<Kbd>Space</Kbd>
{/snippet}
