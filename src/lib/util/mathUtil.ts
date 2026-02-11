export function calculatePercentage(completed: number, total: number) {
	const percent = Math.floor((completed / total) * 100);
	return Math.min(100, Math.max(0, percent));
}
