<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { Progress } from '$lib/shadcn/components/ui/progress';
	import ArrowBigLeft from '@lucide/svelte/icons/arrow-big-left';
	import ArrowBigRight from '@lucide/svelte/icons/arrow-big-right';
	import SettingsRepository from '$lib/repository/local-storage/settingsRepository';
	import AudioUtil from '$lib/util/audioUtil';
	import { onMount } from 'svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import { uiState } from '$lib/state/uiState.svelte.js';
	import Button from '$lib/components/Button.svelte';
	import { toast } from 'svelte-sonner';
	import { studySession } from '$lib/state/studySession.svelte.js';
	import { calculatePercentage } from '$lib/util/mathUtil';
	import CurrentSubjectCard from '$lib/components/review/CurrentSubjectCard.svelte';
	import AnswerCard from '$lib/components/review/AnswerCard.svelte';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import MessageCircle from '@lucide/svelte/icons/message-circle';

	interface Props {
		subject: Subject;
		onCorrectAnswer: () => void;
		onWrongAnswer: () => void;
	}

	const { subject, onCorrectAnswer, onWrongAnswer }: Props = $props();

	const settings = SettingsRepository.get();

	let audioElement: HTMLAudioElement | undefined = $state(undefined);
	let isShowingAnswer = $state(false);

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

<CurrentSubjectCard {isShowingAnswer} {subject} />

<div class="flex-1 space-y-2">
	{#if isShowingAnswer}
		{#if secondaryMeanings.length > 0}
			<AnswerCard
				answers={secondaryMeanings}
				icon={BookOpen}
				label="Secondary meanings"
			/>
		{/if}
		{#if secondaryReadings.length > 0}
			<AnswerCard
				answers={secondaryReadings}
				icon={MessageCircle}
				label="Secondary readings"
			/>
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
