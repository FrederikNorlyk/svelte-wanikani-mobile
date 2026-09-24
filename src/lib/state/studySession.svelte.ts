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

let _studySession: StudySession = $state({
	subjectIds: [],
	index: 0,
	studyType: 'review',
	numberOfCorrectAnswers: 0,
	mascotPair: getRandomMascotPair()
});

export function studySession() {
	return _studySession;
}

export function setStudySession(session: Omit<StudySession, 'mascotPair'>) {
	_studySession = {
		...session,
		mascotPair: getRandomMascotPair()
	};
}

function getRandomMascotPair(): MascotPair {
	return mascotPairs[Math.floor(Math.random() * mascotPairs.length)];
}
