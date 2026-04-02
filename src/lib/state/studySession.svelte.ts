type StudyType = 'review' | 'practice';

interface StudySession {
	subjectIds: number[];
	index: number;
	studyType: StudyType;
	numberOfCorrectAnswers: number;
}

let _studySession: StudySession = $state({
	subjectIds: [],
	index: 0,
	studyType: 'review',
	numberOfCorrectAnswers: 0
});

export function studySession() {
	return _studySession;
}

export function setStudySession(session: StudySession) {
	_studySession = session;
}
