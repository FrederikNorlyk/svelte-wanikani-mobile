<script lang="ts">
	import {
		type Assignment,
		getAllAssignments
	} from '$lib/functions/assignments.remote';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/database/subjectsRepository';
	import Review from '$lib/components/Review.svelte';
	import Synchronizing from '$lib/components/Synchronizing.svelte';
	import { createReview } from '$lib/functions/reviews.remote';
	import Centered from '$lib/components/Centered.svelte';
	import Illustration from '$lib/components/Illustration.svelte';
	import pose_happy_businessman_guts from '$lib/assets/irasutoya/pose_happy_businessman_guts.png';
	import SRSStageToast from '$lib/components/SRSStageToast.svelte';
	import LevelUpPage from '$lib/components/LevelUpPage.svelte';
	import { getUser } from '$lib/functions/user.remote';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import {
		resetStudySession,
		setStudySession,
		studySession
	} from '$lib/state/studySession.svelte';
	import HomePage from '$lib/components/HomePage.svelte';
	import PracticePage from '$lib/components/practice/PracticePage.svelte';
	import ProgressRepository from '$lib/repository/database/progressRepository';

	type AppState =
		| 'loading'
		| 'synchronizing'
		| 'loaded'
		| 'studying'
		| 'defining-practice-session'
		| 'finished'
		| 'level-up';

	let assignments = $state<Assignment[]>([]);
	let appState = $state<AppState>('loading');

	const subject = $derived(async () => {
		if (studySession().index >= studySession().subjectIds.length) {
			return undefined;
		}

		const subjectId = studySession().subjectIds[studySession().index];
		const previousState = appState;

		return await SubjectsRepository.getSubject(subjectId, {
			onSynchronize: () => (appState = 'synchronizing'),
			afterSynchronize: () => (appState = previousState)
		});
	});

	onMount(async () => {
		if ((await SubjectsRepository.count()) === 0) {
			appState = 'synchronizing';
			await SubjectsRepository.synchronize();
		}

		try {
			assignments = await getAllAssignments();
		} catch {
			toast.error('Could not get assignments');
		} finally {
			appState = 'loaded';
		}
	});

	async function onAnswer(wasCorrect: boolean) {
		const currentSubject = await subject();

		if (!currentSubject) {
			toast.error('Could not get current subject');
			return;
		}

		if (studySession().studyType === 'practice') {
			if (wasCorrect) {
				void ProgressRepository.set({
					subjectId: currentSubject.id,
					level: currentSubject.level
				});
			}
			getNextQuestion();
			return;
		}

		try {
			const currentAssignment = assignments[studySession().index];

			if (!currentAssignment) {
				toast.error('Could not get current assignment');
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

			const reviewPromise = createReview({
				assignmentId: currentAssignment.id,
				incorrectReadingAnswers: incorrectReadings,
				incorrectMeaningAnswers: incorrectMeanings
			});

			// Keep the UI instant: don't await normally
			void reviewPromise
				.then(() => {
					Promise.all([UserRepository.getUser(), getUser()]).then(
						([oldUser, newUser]) => {
							if (newUser.level > oldUser.level) {
								UserRepository.setUser(newUser);
								appState = 'level-up';
							}
						}
					);
				})
				.catch(() => {
					toast.error('Could not create review');
				});

			if (wasCorrect && currentAssignment.srsStage === 'Enlightened') {
				toast.custom(SRSStageToast, {
					componentProps: {
						srsStage: 'Burned'
					},
					duration: 1000
				});
			}

			// On the last question, ensure the review has been created before going
			// back to the home screen
			const wasLastQuestion =
				studySession().index === studySession().subjectIds.length - 1;

			if (wasLastQuestion) {
				await reviewPromise;
			}
		} finally {
			getNextQuestion();
		}
	}

	function getNextQuestion() {
		const wasLastQuestion =
			studySession().index === studySession().subjectIds.length - 1;

		if (wasLastQuestion) {
			resetStudySession();
			appState = 'finished';
		} else {
			studySession().index += 1;
		}
	}

	$effect(() => {
		if (appState !== 'finished') {
			return;
		}

		// Linger on the "Good job" graphic for at least 2 seconds
		const minDelay = new Promise<void>((resolve) => {
			window.setTimeout(resolve, 2000);
		});

		getAllAssignments().refresh();

		Promise.all([getAllAssignments(), minDelay]).then(
			([downloadedAssignments]) => {
				assignments = downloadedAssignments;
				appState = 'loaded';
			}
		);
	});
</script>

{#if appState === 'synchronizing'}
	<Synchronizing />
{:else if appState === 'loaded'}
	<HomePage
		numberOfAssignments={assignments.length}
		onPracticeButtonPressed={() => {
			appState = 'defining-practice-session';
		}}
		onReviewButtonPressed={() => {
			setStudySession({
				subjectIds: assignments.map((assignment) => assignment.subjectId),
				index: 0,
				studyType: 'review'
			});
			appState = 'studying';
		}}
	/>
{:else if appState === 'studying'}
	{@const currentSubject = await subject()}
	{#if !currentSubject}
		Something went wrong. Could not get current subject
	{:else}
		<Review
			onCorrectAnswer={() => onAnswer(true)}
			onWrongAnswer={() => onAnswer(false)}
			subject={currentSubject}
		/>
	{/if}
{:else if appState === 'defining-practice-session'}
	<PracticePage
		onCancel={() => {
			appState = 'loaded';
		}}
		onStartPractice={() => {
			appState = 'studying';
		}}
	/>
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
			appState = 'studying';
		}}
	/>
{/if}
