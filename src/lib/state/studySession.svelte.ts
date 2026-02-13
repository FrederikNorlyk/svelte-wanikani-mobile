type StudyType = 'review' | 'practice';

interface StudySession {
	subjectIds: number[];
	index: number;
	studyType: StudyType;
}

let _studySession: StudySession = $state({
	subjectIds: [],
	index: 0,
	studyType: 'review'
});

export function studySession() {
	return _studySession;
}

export function setStudySession(session: StudySession) {
	_studySession = session;
}

export function resetStudySession() {
	_studySession = {
		index: 0,
		subjectIds: [],
		studyType: 'review'
	};
}
