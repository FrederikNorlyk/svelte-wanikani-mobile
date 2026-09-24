import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor
} from '@testing-library/svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
	assignments,
	dependencies,
	resetDependencies,
	user
} from '../../../tests/studySessionFixture';
import Page from './+page.svelte';

beforeEach(resetDependencies);
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

async function click(name: string) {
	await fireEvent.click(await screen.findByRole('button', { name }));
}

it('starts reviews, advances immediately while saving, and reloads on Back', async () => {
	const save = Promise.withResolvers<void>();
	dependencies.createReview.mockReturnValue(save.promise);
	render(Page);
	await click('Start Reviewing');
	await screen.findByText('一');
	await click('Show answer');
	await click('Knew it');
	await screen.findByText('二');
	expect(dependencies.createReview).toHaveBeenCalledWith({
		assignmentId: 101,
		incorrectMeaningAnswers: 0,
		incorrectReadingAnswers: 0
	});
	const reload = vi.fn();
	vi.stubGlobal('location', { reload });
	await click('Back');
	expect(reload).toHaveBeenCalledOnce();
	save.resolve();
});

it('selects practice subjects and returns Home through the completion summary', async () => {
	dependencies.getProgress.mockResolvedValue([
		{ subjectId: 11, level: 1 },
		{ subjectId: 22, level: 1 }
	]);
	render(Page);
	await fireEvent.click(
		await screen.findByRole('button', { name: /Practice/ })
	);
	await fireEvent.click(await screen.findByText('1', { selector: 'button' }));
	await click('Start');
	await screen.findByText('三');
	await click('Show answer');
	await click('Knew it');
	await screen.findByText('You had no wrong answers!');
	expect(dependencies.setProgress).toHaveBeenCalledWith({
		subjectId: 33,
		level: 1
	});
	expect(dependencies.createReview).not.toHaveBeenCalled();
	await click('Continue');
	await screen.findByRole('button', { name: 'Start Reviewing' });
});

it('resumes an unfinished review after celebration and goes Home after the final celebration', async () => {
	dependencies.refreshAssignments.mockResolvedValue([
		assignments.slice(0, 2),
		null
	]);
	render(Page);
	await click('Start Reviewing');
	dependencies.getUser.mockResolvedValue({ ...user, level: 2 });
	await click('Show answer');
	await click('Knew it');
	await screen.findByText('レベルアップ、おめでとう！');
	await click('Continue');
	await screen.findByText('二');
	dependencies.getCachedUser.mockResolvedValue({ ...user, level: 2 });
	dependencies.getUser.mockResolvedValue({ ...user, level: 3 });
	await click('Show answer');
	await click('Knew it');
	await screen.findByText('レベルアップ、おめでとう！');
	await click('Continue');
	await screen.findByRole('button', { name: 'Start Reviewing' });
	await waitFor(() =>
		expect(screen.queryByText('You had no wrong answers!')).toBeNull()
	);
});
