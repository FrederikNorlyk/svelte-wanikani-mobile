import { vi } from 'vitest';
import type { Assignment } from '../src/lib/functions/assignments.remote';
import type { Subject } from '../src/lib/functions/subjects.remote';
import type { User } from '../src/lib/functions/user.remote';

const dependencies = vi.hoisted(() => ({
	getSubject: vi.fn(),
	createReview: vi.fn(),
	getUser: vi.fn(),
	invalidateUser: vi.fn(),
	getCachedUser: vi.fn(),
	setUser: vi.fn(),
	setProgress: vi.fn(),
	getProgress: vi.fn(),
	refreshAssignments: vi.fn(),
	invalidateAssignments: vi.fn(),
	error: vi.fn(),
	feedback: vi.fn()
}));

vi.mock('$lib/repository/database/subjectsRepository', () => ({
	default: {
		getSubject: dependencies.getSubject,
		count: async () => 3,
		getSubjectsByLevel: async () => subjects,
		countAllLevels: async () => ({ 1: 3 })
	}
}));
vi.mock('$lib/functions/reviews.remote', () => ({
	createReview: dependencies.createReview
}));
vi.mock('$lib/functions/user.remote', () => ({
	getUser: () =>
		Object.assign(dependencies.getUser(), {
			refresh: dependencies.invalidateUser
		})
}));
vi.mock('$lib/repository/local-storage/userRepository', () => ({
	default: {
		getUser: dependencies.getCachedUser,
		setUser: dependencies.setUser
	}
}));
vi.mock('$lib/repository/database/progressRepository', () => ({
	default: {
		set: dependencies.setProgress,
		getByLevel: dependencies.getProgress,
		countAllLevels: async () => ({})
	}
}));
vi.mock('$lib/functions/assignments.remote', () => ({
	getAvailableAssignments: () => ({
		refresh: dependencies.invalidateAssignments
	})
}));
vi.mock('$lib/services/assignmentService', () => ({
	refresh: dependencies.refreshAssignments
}));
vi.mock('$lib/functions/lessons.remote', () => ({
	getAvailableLessonsCount: async () => 0
}));
vi.mock('svelte-sonner', () => ({
	toast: { error: dependencies.error, custom: dependencies.feedback }
}));

export const user: User = {
	level: 1,
	maxLevelGranted: 60,
	currentVacationStartedAt: undefined,
	reviewsPresentationOrder: 'lower_srs_category_first'
};

export const subjects: Subject[] = [
	{ id: 11, type: 'radical', characters: '一' },
	{ id: 22, type: 'kanji', characters: '二' },
	{ id: 33, type: 'vocabulary', characters: '三' }
].map((subject) => ({
	...subject,
	type: subject.type as Subject['type'],
	level: 1,
	documentUrl: 'https://www.wanikani.com',
	characterImageUrl: undefined,
	characterImageSvg: undefined,
	meanings: [{ meaning: 'Meaning', primary: true }],
	readings: [],
	audio: [],
	primaryMeaning: 'Meaning',
	primaryReading: undefined,
	secondaryMeanings: [],
	secondaryReadings: []
}));

export const assignments: Assignment[] = [
	{ id: 101, subjectId: 11, srsStage: 'Apprentice' },
	{ id: 202, subjectId: 22, srsStage: 'Guru' },
	{ id: 303, subjectId: 33, srsStage: 'Enlightened' }
];

export function resetDependencies() {
	vi.resetAllMocks();
	vi.stubGlobal('Notification', { permission: 'denied' });
	dependencies.getSubject.mockImplementation(async (id: number) =>
		subjects.find((subject) => subject.id === id)
	);
	dependencies.createReview.mockResolvedValue(undefined);
	dependencies.getUser.mockResolvedValue(user);
	dependencies.getCachedUser.mockResolvedValue(user);
	dependencies.setProgress.mockResolvedValue(undefined);
	dependencies.getProgress.mockResolvedValue([]);
	dependencies.refreshAssignments.mockResolvedValue([assignments, null]);
	localStorage.setItem(
		'settings',
		JSON.stringify({ playAudio: false, preferredAudio: 'Random' })
	);
}

export { dependencies };
