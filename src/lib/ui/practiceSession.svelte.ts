import type { Subject } from '$lib/functions/subjects.remote';

interface PracticeSession {
	subjects: Subject[];
	index: number;
}

export const practiceSession: PracticeSession = $state({
	subjects: [],
	index: 0
});
