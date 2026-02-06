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
	import SRSStageToast from '$lib/components/SRSStageToast.svelte';
	import LevelUpPage from '$lib/components/LevelUpPage.svelte';
	import { getUser } from '$lib/functions/user.remote';
	import UserRepository from '$lib/repository/userRepository';

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

			setTimeout(() => {
				appState = 'loaded';
			}, 5000);
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
				currentSubject.type === 'kanji' ||
				currentSubject.type === 'vocabulary'
			) {
				incorrectReadings = 1;
			}
		}

		void createReview({
			assignmentId: currentAssignment.id,
			incorrectReadingAnswers: incorrectReadings,
			incorrectMeaningAnswers: incorrectMeanings
		});

		if (wasCorrect && currentAssignment.srsStage === 'Enlightened') {
			toast.custom(SRSStageToast, {
				componentProps: {
					srsStage: 'Burned'
				},
				duration: 1000
			});
		}

		Promise.all([UserRepository.getUser(), getUser()]).then(
			([oldUser, newUser]) => {
				if (newUser.level > oldUser.level) {
					appState = 'level-up';
				}
			}
		);

		void getNextSubject();
	}
</script>

<main class="flex flex-1 flex-col gap-2">
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
				onCorrectAnswer={() => onAnswer(true)}
				onWrongAnswer={() => onAnswer(false)}
				progress={progress()}
				subject={currentSubject}
			/>
		{/if}
	{:else if appState === 'finished'}
		<Centered>
			<Illustration
				alt="An illustration of a male office worker in a suit, celebrating with a triumphant fist pump."
				src={pose_happy_businessman_guts}
			>
				<p>Great job!</p>
			</Illustration>
		</Centered>
	{:else if appState === 'level-up'}
		<LevelUpPage
			onContinue={() => {
				appState = 'reviewing';
			}}
		/>
	{/if}
</main>
