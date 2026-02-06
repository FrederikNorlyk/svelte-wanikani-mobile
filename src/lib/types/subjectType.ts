export const subjectTypes = [
	'vocabulary',
	'kana_vocabulary',
	'kanji',
	'radical'
] as const;

export type SubjectType = (typeof subjectTypes)[number];
