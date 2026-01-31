<script lang="ts">
	import {
		type Assignment,
		getAllAssignments
	} from '$lib/functions/assignments.remote';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import type { Subject } from '$lib/functions/subjects.remote';
	import Review from '$lib/components/Review.svelte';
	import StartPage from '$lib/components/StartPage.svelte';
	import Synchronizing from '$lib/components/Synchronizing.svelte';
	import { createReview } from '$lib/functions/reviews.remote';
	import Centered from '$lib/components/Centered.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import pose_happy_businessman_guts from '$lib/assets/irasutoya/pose_happy_businessman_guts.png';
	import SettingsSheet from '$lib/components/SettingsSheet.svelte';
	import { getSrsStage } from '$lib/util/srsStageUtil';
	import SRSStageToast, {
		type Variant
	} from '$lib/components/SRSStageToast.svelte';
	import LevelUpPage from '$lib/components/LevelUpPage.svelte';

	type AppState =
		| 'loading'
		| 'synchronizing'
		| 'loaded'
		| 'reviewing'
		| 'finished'
		| 'level-up';

	let remainingAssignments = $state<Assignment[]>([]);
	let currentAssignment = $state<Assignment | undefined>(undefined);
	let currentSubject = $state<Subject | undefined>(undefined);
	let appState = $state<AppState>('loading');

	const totalNumberOfAssignments = $derived(
		remainingAssignments.length + (currentAssignment ? 1 : 0)
	);

	let startingNumberOfAssignments = $state(0);

	const progress = $derived(() => {
		if (startingNumberOfAssignments <= 0) return 0;

		const completed = startingNumberOfAssignments - totalNumberOfAssignments;
		const percent = Math.floor((completed / startingNumberOfAssignments) * 100);

		return Math.min(100, Math.max(0, percent));
	});

	onMount(async () => {
		try {
			remainingAssignments = await getAllAssignments();
			startingNumberOfAssignments = remainingAssignments.length;
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

			currentSubject = await SubjectsRepository.getSubject(
				currentAssignment.subjectId,
				{
					onSynchronize: () => (appState = 'synchronizing'),
					afterSynchronize: () => (appState = previousState)
				}
			);

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

			if (
				currentSubject.object === 'kanji' ||
				currentSubject.object === 'vocabulary'
			) {
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
				return;
			}

			if (!response.result) {
				return;
			}

			const result = response.result;

			const variant: Variant =
				result.endingStage > result.startingStage ? 'success' : 'error';

			toast.custom(SRSStageToast, {
				componentProps: {
					srsStage: getSrsStage(result.endingStage),
					variant: variant
				},
				duration: 1000
			});
		});

		let didLevelUp = false;

		if (didLevelUp) {
			appState = 'level-up';
		} else {
			void getNextSubject();
		}
	}
</script>

<main class="flex flex-1 flex-col gap-2">
	{#if appState === 'loaded' || appState === 'finished'}
		<SettingsSheet />
	{/if}

	{#if appState === 'synchronizing'}
		<Synchronizing />
	{:else if appState === 'loaded'}
		<StartPage
			numberOfAssignments={totalNumberOfAssignments}
			onStartReview={() => {
				appState = 'reviewing';
			}}
		/>
	{:else if appState === 'reviewing'}
		{#if !currentSubject}
			Something went wrong.
		{:else}
			<Review
				subject={currentSubject}
				progress={progress()}
				onCorrectAnswer={() => onAnswer(true)}
				onWrongAnswer={() => onAnswer(false)}
			/>
		{/if}
	{:else if appState === 'finished'}
		<Centered>
			<Illustration
				src={pose_happy_businessman_guts}
				alt="An illustration of a male office worker in a suit, celebrating with a triumphant fist pump."
			>
				<p>Great job!</p>
			</Illustration>
		</Centered>
	{:else if appState === 'level-up'}
		<LevelUpPage
			level={58}
			onContinue={() => {
				appState = 'reviewing';
				getNextSubject();
			}}
		/>
	{/if}
</main>
