<script lang="ts">
	import { type Assignment, getAllAssignments } from '$lib/functions/assignments.remote';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import type { Subject } from '$lib/functions/subjects.remote';
	import Review from '$lib/components/Review.svelte';
	import { Button } from '$lib/shadcn/components/ui/button';
	import { logout } from '$lib/functions/auth.remote';
	import LogOutButton from '$lib/components/LogOutButton.svelte';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';
	import NoReviews from '$lib/components/NoReviews.svelte';
	import StartPage from '$lib/components/StartPage.svelte';
	import Synchronizing from '$lib/components/Synchronizing.svelte';
	import { createReview } from '$lib/functions/reviews.remote';

	let assignments = $state<Assignment[]>([]);
	let currentAssignment = $state<Assignment | undefined>(undefined);
	let currentSubject = $state<Subject | undefined>(undefined);
	let appState = $state<'loading' | 'synchronizing' | 'loaded' | 'reviewing' | 'finished'>(
		'loading'
	);

	onMount(async () => {
		try {
			assignments = await getAllAssignments();
			await getNextSubject();
		} catch {
			toast.error('Something went wrong');
			return;
		} finally {
			appState = 'loaded';
		}
	});

	async function getNextSubject() {
		currentAssignment = assignments.shift();

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

<main class="flex flex-1 flex-col">
	{#if appState === 'loading'}
		<span></span>
	{:else if appState === 'synchronizing'}
		<Synchronizing />
	{:else if appState === 'loaded'}
		<LogOutButton />
		{#if assignments.length === 0}
			<NoReviews />
		{:else}
			<StartPage {assignments} onStartReview={() => (appState = 'reviewing')} />
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
		Great job!
	{/if}
</main>
