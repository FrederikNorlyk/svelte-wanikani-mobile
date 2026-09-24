import SRSStageToast from '$lib/components/SRSStageToast.svelte';
import type { Assignment } from '$lib/functions/assignments.remote';
import * as ReviewAPI from '$lib/functions/reviews.remote';
import * as UserAPI from '$lib/functions/user.remote';
import ProgressRepository from '$lib/repository/database/progressRepository';
import SubjectsRepository from '$lib/repository/database/subjectsRepository';
import UserRepository from '$lib/repository/local-storage/userRepository';
import { toast } from 'svelte-sonner';

type StudyType = 'review' | 'practice';

export const mascotPairs = [
	'black-cat',
	'daruma',
	'dog',
	'fox',
	'lucky-cat',
	'tanuki'
] as const;

export type MascotPair = (typeof mascotPairs)[number];

interface StudySession {
	subjectIds: number[];
	index: number;
	studyType: StudyType;
	numberOfCorrectAnswers: number;
	mascotPair: MascotPair;
}

export type StudySessionState = Readonly<Omit<StudySession, 'subjectIds'>> & {
	readonly subjectIds: readonly number[];
};

function getRandomMascotPair(): MascotPair {
	return mascotPairs[Math.floor(Math.random() * mascotPairs.length)];
}

export function createStudySession({
	refreshAssignments
}: {
	refreshAssignments: () => Promise<unknown>;
}) {
	let state = $state<StudySession>({
		subjectIds: [],
		index: 0,
		studyType: 'review',
		numberOfCorrectAnswers: 0,
		mascotPair: getRandomMascotPair()
	});
	let screen = $state<'home' | 'studying' | 'finished'>('home');
	let celebrating = $state(false);
	let synchronizing = $state(false);
	let reviewAssignments: Assignment[] = [];
	let finished = false;
	let finalAnswered = false;
	let refreshPending = $state(false);
	let delayElapsed = $state(false);
	let completionTimer: ReturnType<typeof setTimeout> | undefined;
	let disposed = false;

	function start(studyType: StudyType, subjectIds: number[]) {
		clearTimeout(completionTimer);
		disposed = false;
		synchronizing = false;
		refreshPending = false;
		finalAnswered = false;
		celebrating = false;
		delayElapsed = false;
		finished = false;
		reviewAssignments = [];
		state = {
			subjectIds: [...subjectIds],
			index: 0,
			studyType,
			numberOfCorrectAnswers: 0,
			mascotPair: getRandomMascotPair()
		};
		screen = 'studying';
	}

	function advance() {
		if (state.index !== state.subjectIds.length - 1) {
			state.index++;
			return;
		}
		// Repeated final clicks still submit and count; coordinate completion once.
		if (finished) return;
		finished = true;
		const finishingSession = state;
		finalAnswered = true;
		screen = 'finished';
		refreshPending = true;
		completionTimer = setTimeout(() => {
			delayElapsed = true;
		}, 5000);
		void refreshAssignments()
			.catch((error) => {
				console.error(error);
				toast.error('Could not get assignments');
			})
			.finally(() => {
				if (state === finishingSession && !disposed) refreshPending = false;
			});
	}

	async function currentSubject() {
		const loadingSession = state;
		const id = state.subjectIds[state.index];
		return id === undefined
			? undefined
			: SubjectsRepository.getSubject(id, {
					onSynchronize: () => {
						if (state === loadingSession && !disposed) synchronizing = true;
					},
					afterSynchronize: () => {
						if (state === loadingSession && !disposed) synchronizing = false;
					}
				});
	}

	return {
		get state(): StudySessionState {
			return state;
		},
		get screen() {
			// Background completion work cannot replace a celebration.
			if (celebrating) return 'level-up';
			if (screen === 'studying' && delayElapsed) return 'loading';
			if (screen === 'finished' && delayElapsed)
				return refreshPending ? 'loading' : 'home';
			if (screen === 'studying' && synchronizing) return 'synchronizing';
			return screen;
		},
		currentSubject,
		back() {
			location.reload();
		},
		dispose() {
			disposed = true;
			clearTimeout(completionTimer);
		},
		continue() {
			if (celebrating) {
				celebrating = false;
				if (!finalAnswered) return;
			}
			clearTimeout(completionTimer);
			delayElapsed = true;
		},
		startReview(assignments: Assignment[]) {
			start(
				'review',
				assignments.map((assignment) => assignment.subjectId)
			);
			reviewAssignments = [...assignments];
		},
		startPractice(subjectIds: number[]) {
			start('practice', subjectIds);
		},
		async answer(wasCorrect: boolean) {
			const answeringSession = state;
			const subject = await currentSubject();
			if (state !== answeringSession || disposed) return;
			if (!subject) {
				toast.error('Could not get current subject');
				return;
			}
			if (wasCorrect) state.numberOfCorrectAnswers++;
			if (state.studyType === 'practice') {
				if (wasCorrect)
					void ProgressRepository.set({
						subjectId: subject.id,
						level: subject.level
					});
				advance();
				return;
			}
			// Keep lookup after the subject await: overlapping clicks use the live index.
			const assignment = reviewAssignments[state.index];
			const submission = ReviewAPI.createReview({
				assignmentId: assignment.id,
				incorrectMeaningAnswers: wasCorrect ? 0 : 1,
				incorrectReadingAnswers:
					!wasCorrect &&
					(subject.type === 'kanji' || subject.type === 'vocabulary')
						? 1
						: 0
			});
			void submission
				.then(
					async () => {
						if (state !== answeringSession || disposed) return;
						const [oldUser, newUser] = await Promise.all([
							UserRepository.getUser(),
							UserAPI.getUser()
						]);
						if (
							state === answeringSession &&
							!disposed &&
							newUser.level > oldUser.level
						) {
							UserRepository.setUser(newUser);
							celebrating = true;
						}
					},
					() => {}
				)
				.catch((error) => {
					console.error(error);
					toast.error('Could not get user information');
				});
			const review = submission.catch((error) => {
				console.error(error);
				toast.error('Could not create review');
			});
			UserAPI.getUser().refresh();
			if (wasCorrect && assignment.srsStage === 'Enlightened') {
				toast.custom(SRSStageToast, {
					componentProps: { srsStage: 'Burned' },
					duration: 1000
				});
			}
			if (state.index === state.subjectIds.length - 1) {
				finalAnswered = true;
				// Wait for this attempt only, never earlier outstanding submissions.
				await review;
			}
			if (state === answeringSession && !disposed) advance();
		}
	};
}
