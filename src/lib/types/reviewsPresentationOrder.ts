export const reviewsPresentationOrder = [
	'shuffled',
	'apprentice_first',
	'lower_srs_category_first',
	'lower_levels_first'
];

export type ReviewsPresentationOrder =
	(typeof reviewsPresentationOrder)[number];
