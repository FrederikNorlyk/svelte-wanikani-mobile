import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
	assignments,
	dependencies,
	resetDependencies,
	user
} from '../../../tests/studySessionFixture';
import { createStudySession, mascotPairs } from './studySession.svelte';

beforeEach(() => {
	resetDependencies();
	vi.useFakeTimers();
	vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

it('starts reviews in the supplied assignment order with fresh progress', () => {
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview([assignments[2], assignments[0]]);
	expect(session.state.subjectIds).toEqual([33, 11]);
	expect(session.state.index).toBe(0);
	expect(session.state.numberOfCorrectAnswers).toBe(0);
	expect(session.state.studyType).toBe('review');
	expect(session.screen).toBe('studying');
	expect(mascotPairs).toContain(session.state.mascotPair);
});

it('submits an ordinary answer immediately and advances while the save is pending', async () => {
	const save = Promise.withResolvers<void>();
	dependencies.createReview.mockReturnValue(save.promise);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(true);
	expect(dependencies.createReview).toHaveBeenCalledWith({
		assignmentId: 101,
		incorrectReadingAnswers: 0,
		incorrectMeaningAnswers: 0
	});
	expect(session.state.index).toBe(1);
	expect((await session.currentSubject())?.id).toBe(22);
	expect(session.state.numberOfCorrectAnswers).toBe(1);
	expect(session.screen).toBe('studying');
	save.resolve();
});

it.each([
	['radical', 0],
	['kana_vocabulary', 0],
	['kanji', 1],
	['vocabulary', 1]
] as const)(
	'maps an incorrect %s answer to the existing review counts',
	async (type, readings) => {
		dependencies.getSubject.mockResolvedValue({ id: 11, level: 1, type });
		const session = createStudySession({
			refreshAssignments: dependencies.refreshAssignments
		});
		session.startReview(assignments);
		await session.answer(false);
		expect(dependencies.createReview).toHaveBeenCalledWith({
			assignmentId: 101,
			incorrectReadingAnswers: readings,
			incorrectMeaningAnswers: 1
		});
		expect(session.state.numberOfCorrectAnswers).toBe(0);
	}
);

it('reports a rejected ordinary save and continues at the next question', async () => {
	vi.spyOn(console, 'error').mockImplementation(() => {});
	const save = Promise.withResolvers<void>();
	dependencies.createReview.mockReturnValue(save.promise);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(false);
	save.reject(new Error('offline'));
	await vi.waitFor(() =>
		expect(dependencies.error).toHaveBeenCalledWith('Could not create review')
	);
	expect(session.state.index).toBe(1);
	expect(session.screen).toBe('studying');
});

it('starts practice with the selection and records only correct answers locally', async () => {
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(true);
	session.startPractice([33, 11, 22]);
	expect(session.state.subjectIds).toEqual([33, 11, 22]);
	expect(session.state.index).toBe(0);
	expect(session.state.numberOfCorrectAnswers).toBe(0);
	expect(session.state.studyType).toBe('practice');
	dependencies.createReview.mockClear();
	await session.answer(true);
	await session.answer(false);
	expect(dependencies.setProgress.mock.calls).toEqual([
		[{ subjectId: 33, level: 1 }]
	]);
	expect(dependencies.createReview).not.toHaveBeenCalled();
	expect(session.state.index).toBe(2);
	expect(session.state.numberOfCorrectAnswers).toBe(1);
});

it.each(['resolve', 'reject'] as const)(
	'waits for the final save to %s, but not earlier saves',
	async (outcome) => {
		const earlier = Promise.withResolvers<void>();
		const final = Promise.withResolvers<void>();
		dependencies.createReview
			.mockReturnValueOnce(earlier.promise)
			.mockReturnValueOnce(final.promise);
		const session = createStudySession({
			refreshAssignments: dependencies.refreshAssignments
		});
		session.startReview(assignments.slice(0, 2));
		await session.answer(true);
		const answering = session.answer(true);
		await vi.waitFor(() =>
			expect(dependencies.createReview).toHaveBeenCalledTimes(2)
		);
		expect(session.screen).toBe('studying');
		expect(dependencies.refreshAssignments).not.toHaveBeenCalled();
		if (outcome === 'resolve') final.resolve();
		else final.reject(new Error('offline'));
		await answering;
		expect(session.screen).toBe('finished');
		expect(session.state.index).toBe(1);
		expect(dependencies.refreshAssignments).toHaveBeenCalled();
		if (outcome === 'reject')
			expect(dependencies.error).toHaveBeenCalledWith(
				'Could not create review'
			);
		earlier.resolve();
	}
);

it('keeps the ordinary summary for five seconds even if refresh finishes first', async () => {
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startPractice([11]);
	await session.answer(true);
	await vi.advanceTimersByTimeAsync(4999);
	expect(session.screen).toBe('finished');
	await vi.advanceTimersByTimeAsync(1);
	expect(session.screen).toBe('home');
});

it.each(['timer', 'continue'] as const)(
	'shows loading after %s until the refresh settles',
	async (action) => {
		const refresh = Promise.withResolvers<void>();
		dependencies.refreshAssignments.mockReturnValue(refresh.promise);
		const session = createStudySession({
			refreshAssignments: dependencies.refreshAssignments
		});
		session.startPractice([11]);
		await session.answer(false);
		if (action === 'timer') await vi.advanceTimersByTimeAsync(5000);
		else session.continue();
		expect(session.screen).toBe('loading');
		refresh.resolve();
		await vi.advanceTimersByTimeAsync(0);
		expect(session.screen).toBe('home');
	}
);

it('reports refresh failure and returns Home after Continue', async () => {
	dependencies.refreshAssignments.mockRejectedValue(new Error('offline'));
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startPractice([11]);
	await session.answer(true);
	await vi.advanceTimersByTimeAsync(0);
	expect(session.screen).toBe('finished');
	expect(dependencies.error).toHaveBeenCalledWith('Could not get assignments');
	session.continue();
	expect(session.screen).toBe('home');
});

it('immediately celebrates a detected level-up and resumes the current unfinished question', async () => {
	dependencies.getUser.mockResolvedValue({ ...user, level: 2 });
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(true);
	await vi.advanceTimersByTimeAsync(0);
	expect(session.screen).toBe('level-up');
	expect(dependencies.setUser).toHaveBeenCalledWith({ ...user, level: 2 });
	session.continue();
	expect(session.screen).toBe('studying');
	expect((await session.currentSubject())?.id).toBe(22);
});

it.each([
	['settled', 0],
	['pending', 0],
	['failed', 0],
	['settled', 5000],
	['pending', 5000],
	['failed', 5000]
] as const)(
	'dismisses a finished-session celebration with refresh %s after %i ms without revisiting the summary',
	async (refreshState, elapsed) => {
		const refresh = Promise.withResolvers<void>();
		dependencies.refreshAssignments.mockReturnValue(refresh.promise);
		dependencies.getUser.mockResolvedValue({ ...user, level: 2 });
		const session = createStudySession({
			refreshAssignments: dependencies.refreshAssignments
		});
		session.startReview([assignments[0]]);
		await session.answer(true);
		await vi.advanceTimersByTimeAsync(0);
		expect(session.screen).toBe('level-up');
		if (refreshState === 'settled') refresh.resolve();
		if (refreshState === 'failed') refresh.reject(new Error('offline'));
		await vi.advanceTimersByTimeAsync(elapsed);
		expect(session.screen).toBe('level-up');
		session.continue();
		expect(session.screen).toBe(
			refreshState === 'pending' ? 'loading' : 'home'
		);
		refresh.resolve();
		await vi.advanceTimersByTimeAsync(0);
		expect(session.screen).toBe('home');
	}
);

it('bypasses the summary when a final answer is pending at celebration dismissal', async () => {
	const firstSave = Promise.withResolvers<void>();
	const finalSave = Promise.withResolvers<void>();
	dependencies.createReview
		.mockReturnValueOnce(firstSave.promise)
		.mockReturnValueOnce(finalSave.promise);
	dependencies.getUser.mockResolvedValue({ ...user, level: 2 });
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments.slice(0, 2));
	await session.answer(true);
	const finalAnswer = session.answer(true);
	await vi.advanceTimersByTimeAsync(0);
	firstSave.resolve();
	await vi.advanceTimersByTimeAsync(0);
	expect(session.screen).toBe('level-up');
	session.continue();
	expect(session.screen).toBe('loading');
	dependencies.getCachedUser.mockResolvedValue({ ...user, level: 2 });
	finalSave.resolve();
	await finalAnswer;
	await vi.advanceTimersByTimeAsync(0);
	expect(session.screen).toBe('home');
});

it('preserves overlapping ordinary clicks: two submissions, counts, and advances', async () => {
	const save = Promise.withResolvers<void>();
	dependencies.createReview.mockReturnValue(save.promise);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await Promise.all([session.answer(true), session.answer(true)]);
	expect(dependencies.createReview.mock.calls).toEqual([
		[
			{
				assignmentId: 101,
				incorrectMeaningAnswers: 0,
				incorrectReadingAnswers: 0
			}
		],
		[
			{
				assignmentId: 202,
				incorrectMeaningAnswers: 0,
				incorrectReadingAnswers: 0
			}
		]
	]);
	expect(session.state.index).toBe(2);
	expect(session.state.numberOfCorrectAnswers).toBe(2);
	save.resolve();
});

it('preserves repeated clicks on the pending final question without deduplicating counts or submissions', async () => {
	const first = Promise.withResolvers<void>();
	const second = Promise.withResolvers<void>();
	dependencies.createReview
		.mockReturnValueOnce(first.promise)
		.mockReturnValueOnce(second.promise);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview([assignments[0]]);
	const answers = [session.answer(true), session.answer(true)];
	await vi.advanceTimersByTimeAsync(0);
	expect(dependencies.createReview.mock.calls).toEqual([
		[
			{
				assignmentId: 101,
				incorrectMeaningAnswers: 0,
				incorrectReadingAnswers: 0
			}
		],
		[
			{
				assignmentId: 101,
				incorrectMeaningAnswers: 0,
				incorrectReadingAnswers: 0
			}
		]
	]);
	expect(session.state.numberOfCorrectAnswers).toBe(2);
	expect(session.state.index).toBe(0);
	expect(session.screen).toBe('studying');
	second.resolve();
	await answers[1];
	expect(session.screen).toBe('finished');
	first.resolve();
	await answers[0];
	expect(session.state.index).toBe(0);
});

it('retains Burned feedback for a correct Enlightened review', async () => {
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview([assignments[2]]);
	await session.answer(true);
	expect(dependencies.feedback).toHaveBeenCalledWith(expect.anything(), {
		componentProps: { srsStage: 'Burned' },
		duration: 1000
	});
});

it('reports a missing subject without counting or advancing', async () => {
	dependencies.getSubject.mockResolvedValue(undefined);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(true);
	expect(dependencies.error).toHaveBeenCalledWith(
		'Could not get current subject'
	);
	expect(session.state.index).toBe(0);
	expect(session.state.numberOfCorrectAnswers).toBe(0);
	expect(dependencies.createReview).not.toHaveBeenCalled();
});

it('reloads immediately on Back while a save is pending', async () => {
	const reload = vi.fn();
	vi.stubGlobal('location', { reload });
	const save = Promise.withResolvers<void>();
	dependencies.createReview.mockReturnValue(save.promise);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(true);
	session.back();
	expect(reload).toHaveBeenCalledOnce();
	save.resolve();
});

it('keeps a celebration visible when subject synchronization finishes', async () => {
	dependencies.getUser.mockResolvedValue({ ...user, level: 2 });
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview(assignments);
	await session.answer(true);
	const synchronization = Promise.withResolvers<void>();
	dependencies.getSubject.mockImplementationOnce(async (_id, handlers) => {
		handlers.onSynchronize();
		await synchronization.promise;
		handlers.afterSynchronize();
	});
	const loading = session.currentSubject();
	expect(session.screen).toBe('synchronizing');
	await vi.advanceTimersByTimeAsync(0);
	expect(session.screen).toBe('level-up');
	synchronization.resolve();
	await loading;
	expect(session.screen).toBe('level-up');
	session.continue();
	expect(session.screen).toBe('studying');
});

it('keeps a new session independent of a previous pending final click', async () => {
	const first = Promise.withResolvers<void>();
	const repeated = Promise.withResolvers<void>();
	dependencies.createReview
		.mockReturnValueOnce(first.promise)
		.mockReturnValueOnce(repeated.promise);
	const session = createStudySession({
		refreshAssignments: dependencies.refreshAssignments
	});
	session.startReview([assignments[0]]);
	const answer = session.answer(true);
	const repeatedAnswer = session.answer(true);
	await vi.advanceTimersByTimeAsync(0);
	first.resolve();
	await answer;
	await vi.advanceTimersByTimeAsync(5000);
	session.startPractice([22, 33]);
	repeated.resolve();
	await repeatedAnswer;
	expect(session.screen).toBe('studying');
	expect(session.state.index).toBe(0);
	expect(session.state.numberOfCorrectAnswers).toBe(0);
});
