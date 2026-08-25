<script lang="ts">
	import * as AssignmentAPI from '$lib/functions/assignments.remote';
	import {
		type Assignment,
		type NextReviewData
	} from '$lib/functions/assignments.remote';
	import * as AssignmentService from '$lib/services/assignmentService';
	import { onMount, untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/database/subjectsRepository';
	import Review from '$lib/components/Review.svelte';
	import Synchronizing from '$lib/components/Synchronizing.svelte';
	import * as ReviewAPI from '$lib/functions/reviews.remote';
	import SRSStageToast from '$lib/components/SRSStageToast.svelte';
	import LevelUpPage from '$lib/components/LevelUpPage.svelte';
	import type { User } from '$lib/functions/user.remote';
	import * as UserAPI from '$lib/functions/user.remote';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import {
		setStudySession,
		studySession
	} from '$lib/state/studySession.svelte';
	import HomePage from '$lib/components/HomePage.svelte';
	import PracticePage from '$lib/components/practice/PracticePage.svelte';
	import ProgressRepository from '$lib/repository/database/progressRepository';
	import AppMetadataRepository from '$lib/repository/local-storage/appMetadataRepository';
	import StudySessionFinished from '$lib/components/StudySessionFinished.svelte';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';

	type AppState =
		| 'loading'
		| 'synchronizing'
		| 'loaded'
		| 'studying'
		| 'defining-practice-session'
		| 'finished'
		| 'level-up';

	let assignments = $state<Assignment[]>([]);
	let nextReviewData = $state<NextReviewData | null>(null);
	let appState = $state<AppState>('loading');
	let user = $state<User | undefined>(undefined);

	// Used by the StudySessionFinished component to skip the 5-second wait
	let timeoutAbortController = $state(new AbortController());

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

	onMount(() => {
		const refreshData = async () => {
			appState = 'loading';

			// Update the cached user
			try {
				user = await UserRepository.getUser({ forceSync: true });
			} catch (e) {
				console.error(e);
				toast.error('Could not get user information');
			}

			const promises: Promise<void>[] = [];

			const assignmentPromise = AssignmentService.refresh(
				user?.reviewsPresentationOrder ?? 'shuffled'
			)
				.then(([a, n]) => {
					assignments = a;
					nextReviewData = n;
				})
				.catch((e) => {
					console.error(e);
					toast.error('Could not get assignments');
				});

			promises.push(assignmentPromise);

			if ((await SubjectsRepository.count()) === 0) {
				appState = 'synchronizing';

				promises.push(
					SubjectsRepository.synchronize().catch((e) => {
						console.error(e);
						toast.error('Could not synchronize with WaniKani');
					})
				);
			}

			Promise.all(promises).finally(() => {
				appState = 'loaded';
			});
		};

		void refreshData();

		const handleVisibilityChange = () => {
			if (document.visibilityState !== 'visible') {
				return;
			}

			if (appState !== 'loaded') {
				return;
			}

			const metadata = AppMetadataRepository.get();

			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const lastFetchedDate = new Date(metadata.lastAssignmentsFetchTimestamp);
			lastFetchedDate.setMinutes(0, 0, 0);

			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const currentDate = new Date();
			currentDate.setMinutes(0, 0, 0);

			if (lastFetchedDate.getTime() === currentDate.getTime()) {
				console.trace('No need to refresh data. Still in same hour');
				return;
			}

			void refreshData();
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	async function onAnswer(wasCorrect: boolean) {
		const currentSubject = await subject();

		if (!currentSubject) {
			toast.error('Could not get current subject');
			return;
		}

		if (wasCorrect) {
			studySession().numberOfCorrectAnswers++;
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

			const reviewPromise = ReviewAPI.createReview({
				assignmentId: currentAssignment.id,
				incorrectReadingAnswers: incorrectReadings,
				incorrectMeaningAnswers: incorrectMeanings
			});

			// Invalidate the SvelteKit cache
			UserAPI.getUser().refresh();

			// Keep the UI instant: don't await normally
			void reviewPromise
				.then(() => {
					Promise.all([UserRepository.getUser(), UserAPI.getUser()]).then(
						([oldUser, newUser]) => {
							if (newUser.level > oldUser.level) {
								UserRepository.setUser(newUser);
								appState = 'level-up';
							}
						}
					);
				})
				.catch((e) => {
					console.error(e);
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
			appState = 'finished';
		} else {
			studySession().index++;
		}
	}

	$effect(() => {
		if (appState !== 'finished') {
			return;
		}

		untrack(() => {
			void finishStudySession();
		});
	});

	async function finishStudySession() {
		// Linger on the "Study session finished" illustration for at least 5 seconds
		const minDelay = new Promise<void>((resolve) => {
			const id = window.setTimeout(resolve, 5000);

			timeoutAbortController.signal.addEventListener('abort', () => {
				window.clearTimeout(id);
				resolve();
			});
		}).then(() => {
			// If the delay ends before the assignments promise, then we enter a loading state.
			appState = 'loading';
		});

		// Invalidate the SvelteKit cache
		AssignmentAPI.getAvailableAssignments().refresh();

		const assignmentPromise = AssignmentService.refresh(
			user?.reviewsPresentationOrder ?? 'shuffled'
		)
			.then(([a, n]) => {
				assignments = a;
				nextReviewData = n;
			})
			.catch((e) => {
				console.error(e);
				toast.error('Could not get assignments');
			});

		await Promise.all([assignmentPromise, minDelay]);

		appState = 'loaded';
	}
</script>

{#if appState === 'synchronizing'}
	<Synchronizing />
{:else if appState === 'loading'}
	<Spinner
		class="absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 text-primary/10"
	/>
{:else if appState === 'loaded'}
	<HomePage
		{nextReviewData}
		numberOfAssignments={assignments.length}
		onPracticeButtonPressed={() => {
			appState = 'defining-practice-session';
		}}
		onReviewButtonPressed={() => {
			setStudySession({
				subjectIds: assignments.map((assignment) => assignment.subjectId),
				index: 0,
				studyType: 'review',
				numberOfCorrectAnswers: 0
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
	<StudySessionFinished
		onContinue={() => {
			timeoutAbortController.abort();
			timeoutAbortController = new AbortController();
		}}
	/>
{:else if appState === 'level-up'}
	<LevelUpPage
		onContinue={() => {
			appState = 'studying';
		}}
	/>
{/if}
