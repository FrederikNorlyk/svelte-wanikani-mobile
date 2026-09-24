<script lang="ts">
	import * as AssignmentAPI from '$lib/functions/assignments.remote';
	import * as LessonAPI from '$lib/functions/lessons.remote';
	import {
		type Assignment,
		type NextReviewData
	} from '$lib/functions/assignments.remote';
	import * as AssignmentService from '$lib/services/assignmentService';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/database/subjectsRepository';
	import Review from '$lib/components/review/Review.svelte';
	import Synchronizing from '$lib/components/Synchronizing.svelte';
	import LevelUpPage from '$lib/components/LevelUpPage.svelte';
	import type { User } from '$lib/functions/user.remote';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import { createStudySession } from '$lib/state/studySession.svelte';
	import HomePage from '$lib/components/home/HomePage.svelte';
	import PracticePage from '$lib/components/practice/PracticePage.svelte';
	import AppMetadataRepository from '$lib/repository/local-storage/appMetadataRepository';
	import StudySessionFinished from '$lib/components/StudySessionFinished.svelte';
	import { Spinner } from '$lib/shadcn/components/ui/spinner';

	type HomeState =
		'loading' | 'synchronizing' | 'loaded' | 'defining-practice-session';

	let assignments = $state<Assignment[]>([]);
	let numberOfLessons = $state(0);
	let nextReviewData = $state<NextReviewData | null>(null);
	let homeState = $state<HomeState>('loading');
	let user = $state<User | undefined>(undefined);

	const session = createStudySession({
		refreshAssignments: async () => {
			AssignmentAPI.getAvailableAssignments().refresh();
			const [a, n] = await AssignmentService.refresh(
				user?.reviewsPresentationOrder ?? 'shuffled'
			);
			assignments = a;
			nextReviewData = n;
		}
	});
	const appState = $derived(
		session.screen === 'home' ? homeState : session.screen
	);

	onMount(() => {
		const refreshData = async () => {
			homeState = 'loading';

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

			promises.push(
				LessonAPI.getAvailableLessonsCount()
					.then((count) => {
						numberOfLessons = count;
					})
					.catch((e) => {
						console.error(e);
						toast.error('Could not get available lessons');
					})
			);

			if ((await SubjectsRepository.count()) === 0) {
				homeState = 'synchronizing';

				promises.push(
					SubjectsRepository.synchronize().catch((e) => {
						console.error(e);
						toast.error('Could not synchronize with WaniKani');
					})
				);
			}

			Promise.all(promises).finally(() => {
				homeState = 'loaded';
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
			session.dispose();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});
</script>

{#if appState === 'synchronizing'}
	<Synchronizing />
{:else if appState === 'loading'}
	<Spinner
		class="absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 text-white opacity-40 dark:opacity-20"
	/>
{:else if appState === 'loaded'}
	<HomePage
		{nextReviewData}
		numberOfAssignments={assignments.length}
		{numberOfLessons}
		onPracticeButtonPressed={() => {
			homeState = 'defining-practice-session';
		}}
		onReviewButtonPressed={() => {
			session.startReview(assignments);
		}}
	/>
{:else if appState === 'studying'}
	{@const currentSubject = await session.currentSubject()}
	{#if !currentSubject}
		Something went wrong. Could not get current subject
	{:else}
		<Review
			onCancel={session.back}
			onCorrectAnswer={() => session.answer(true)}
			onWrongAnswer={() => session.answer(false)}
			session={session.state}
			subject={currentSubject}
		/>
	{/if}
{:else if appState === 'defining-practice-session'}
	<PracticePage
		onCancel={() => {
			homeState = 'loaded';
		}}
		onStartPractice={(subjectIds) => {
			homeState = 'loaded';
			session.startPractice(subjectIds);
		}}
	/>
{:else if appState === 'finished'}
	<StudySessionFinished onContinue={session.continue} session={session.state} />
{:else if appState === 'level-up'}
	<LevelUpPage onContinue={session.continue} />
{/if}
