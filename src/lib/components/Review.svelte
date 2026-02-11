<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { Progress } from '$lib/shadcn/components/ui/progress';
	// noinspection ES6UnusedImports
	import ExternalLink from '@lucide/svelte/icons/external-link';
	// noinspection ES6UnusedImports
	import ArrowBigLeft from '@lucide/svelte/icons/arrow-big-left';
	// noinspection ES6UnusedImports
	import ArrowBigRight from '@lucide/svelte/icons/arrow-big-right';
	import SettingsRepository from '$lib/repository/local-storage/settingsRepository';
	import AudioUtil from '$lib/util/audioUtil';
	import CharacterHeader from '$lib/components/CharacterHeader.svelte';
	import { onMount } from 'svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import { uiState } from '$lib/state/uiState.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from 'svelte-sonner';
	import { studySession } from '$lib/state/studySession.svelte';
	import { calculatePercentage } from '$lib/util/mathUtil';

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

	const progress = $derived(() => {
		const completed = studySession().index;
		const total = studySession().subjectIds.length;
		return calculatePercentage(completed, total);
	});

	$effect(() => {
		void subject; // Track changes
		isShowingAnswer = false;

		const controller = new AbortController();

		if (settings.playAudio) {
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
					}
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

<CharacterHeader class="text-4xl" {subject} />

<div class="flex-1 space-y-2">
	{#if isShowingAnswer}
		{#if primaryMeaning}
			{@render answerBlock(
				'Meanings',
				primaryMeaning,
				secondaryMeanings,
				'meaning',
				uiState.isShowingKeyboardShortcuts
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
		<Button
			class="flex-1"
			keyboardShortcut={{
				handler: (e) => e.code === 'ArrowLeft' || e.key === 'h',
				hintElement: arrowLeftShortcut
			}}
			onclick={onCorrectAnswer}
			size="lg"
			>Knew it
		</Button>
		<Button
			class="flex-1"
			keyboardShortcut={{
				handler: (e) => e.code === 'ArrowRight' || e.key === 'l',
				hintElement: arrowRightShortcut
			}}
			onclick={onWrongAnswer}
			size="lg"
			variant="secondary"
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
			size="lg"
			>Show answer
		</Button>
	{/if}
</div>

{#snippet answerBlock(
	label: string,
	primaryAnswer: string,
	secondaryAnswers: string[],
	anchor: string,
	shouldRenderKeyboardShortcut: boolean = false
)}
	<a
		class="answer"
		href={`${subject.documentUrl}#${anchor}`}
		rel="external"
		target="_blank"
	>
		<div class="absolute right-4 flex gap-2">
			<ExternalLink class="size-4 text-muted-foreground" />
			{#if shouldRenderKeyboardShortcut}
				<Kbd class="bg-secondary-foreground text-secondary">f</Kbd>
			{/if}
		</div>
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

{#snippet arrowLeftShortcut()}
	<Kbd><ArrowBigLeft /></Kbd>
{/snippet}

{#snippet arrowRightShortcut()}
	<Kbd class="bg-secondary-foreground text-secondary"><ArrowBigRight /></Kbd>
{/snippet}

{#snippet spacebarShortcut()}
	<Kbd>Space</Kbd>
{/snippet}
