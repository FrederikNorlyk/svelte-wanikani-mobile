import type { Subject } from '$lib/functions/subjects.remote';

interface StudySession {
	subjects: Subject[];
	index: number;
}

export const studySession: StudySession = $state({
	subjects: [],
	index: 0
});
