<script lang="ts">
	import { type Assignment, getAllAssignments } from '$lib/functions/assignments.remote';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import type { Subject } from '$lib/functions/subjects.remote';
	import Review from '$lib/components/Review.svelte';
	import LogOutButton from '$lib/components/LogOutButton.svelte';
	import StartPage from '$lib/components/StartPage.svelte';
	import Synchronizing from '$lib/components/Synchronizing.svelte';
	import { createReview } from '$lib/functions/reviews.remote';
	import Centered from '$lib/components/Centered.svelte';

	type AppState = 'loading' | 'synchronizing' | 'loaded' | 'reviewing' | 'finished';

	let remainingAssignments = $state<Assignment[]>([]);
	let currentAssignment = $state<Assignment | undefined>(undefined);
	let currentSubject = $state<Subject | undefined>(undefined);
	let appState = $state<AppState>('loading');

	let totalNumberOfAssignments = $derived(
		remainingAssignments.length + (currentAssignment ? 1 : 0)
	);

	onMount(async () => {
		try {
			remainingAssignments = await getAllAssignments();
			await getNextSubject();
		} catch {
			toast.error('Something went wrong');
			return;
		} finally {
			appState = 'loaded';
		}
	});

	async function getNextSubject() {
		currentAssignment = remainingAssignments.shift();

		if (currentAssignment) {
			const previousState = appState;

			currentSubject = await SubjectsRepository.getSubject(currentAssignment.subjectId, {
				onSynchronize: () => (appState = 'synchronizing'),
				afterSynchronize: () => (appState = previousState)
			});

			if (!currentSubject) {
				toast.error(`Could not get subject #${currentAssignment.subjectId}`);
			}
		} else {
			currentSubject = undefined;
			appState = 'finished';
		}
	}

	async function onAnswer(wasCorrect: boolean) {
		if (!currentAssignment || !currentSubject) {
			toast.error('Something went wrong');
			void getNextSubject();
			return;
		}

		let incorrectReadings = 0;
		let incorrectMeanings = 0;

		if (!wasCorrect) {
			incorrectMeanings = 1;

			if (currentSubject.object === 'kanji' || currentSubject.object === 'vocabulary') {
				incorrectReadings = 1;
			}
		}

		createReview({
			assignmentId: currentAssignment.id,
			incorrectReadingAnswers: incorrectReadings,
			incorrectMeaningAnswers: incorrectMeanings
		}).then((response) => {
			if (!response.success) {
				toast.error(response.error ?? 'Something went wrong');
			}
		});

		void getNextSubject();
	}
</script>

<main class="flex flex-1 flex-col gap-2">
	{#if appState === 'loading'}
		<span></span>
	{:else if appState === 'synchronizing'}
		<Synchronizing />
	{:else if appState === 'loaded'}
		<LogOutButton />
		{#if totalNumberOfAssignments === 0}
			<Centered>
				<p>You have no reviews</p>
			</Centered>
		{:else}
			<StartPage
				numberOfAssignments={totalNumberOfAssignments}
				onStartReview={() => (appState = 'reviewing')}
			/>
		{/if}
	{:else if appState === 'reviewing'}
		{#if !currentSubject}
			Something went wrong.
		{:else}
			<Review
				subject={currentSubject}
				onCorrectAnswer={() => onAnswer(true)}
				onWrongAnswer={() => onAnswer(false)}
			/>
		{/if}
	{:else if appState === 'finished'}
		<LogOutButton />
		<Centered>
			<p>Great job!</p>
		</Centered>
	{/if}
</main>
