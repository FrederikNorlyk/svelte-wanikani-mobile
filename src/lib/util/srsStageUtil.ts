export type SRSStage =
	| 'Apprentice'
	| 'Guru'
	| 'Master'
	| 'Enlightened'
	| 'Burned';

export function getSrsStage(stage: number): SRSStage {
	if (stage <= 4) {
		return 'Apprentice';
	} else if (stage <= 6) {
		return 'Guru';
	} else if (stage === 7) {
		return 'Master';
	} else if (stage === 8) {
		return 'Enlightened';
	}
	return 'Burned';
}
