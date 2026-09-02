import atlasMetadata from '$lib/assets/background/grass-atlas.json';

/** Prepared rectangles and root pivots in the original 1254 × 1254 atlas. */
export const grassSprites = atlasMetadata;

export type GrassTuft = {
	/**
	 * Index of the atlas sprite used to draw this tuft.
	 */
	sprite: number;

	/**
	 * Horizontal root position in the landscape coordinate space.
	 * Increase to move the tuft farther right; decrease to move it farther left.
	 * This controls where the base of the tuft is anchored before scaling and screen cropping are applied.
	 */
	x: number;

	/**
	 * Vertical root position in the landscape coordinate space.
	 * Increase to move the tuft lower; decrease to move it higher.
	 * This controls where the base of the tuft is anchored before scaling and screen cropping are applied.
	 */
	y: number;

	/**
	 * Size multiplier applied when drawing the tuft.
	 * Increase to make the tuft appear larger; decrease to make it appear smaller.
	 * This scales the sprite around its root pivot, so the base stays anchored while the blades grow or shrink.
	 */
	scale: number;

	/**
	 * Resistance to wind-driven bending.
	 * Increase to make the tuft stiffer, so it bends and rotates less for the same wind.
	 * Decrease to make the tuft more flexible, so it leans, shears, and sways more dramatically.
	 */
	stiffness: number;

	/**
	 * The strength of the wind effect applied to this tuft.
	 * Increase to make the tuft react more strongly to wind, producing wider sway and larger bends.
	 * Decrease to make the tuft calmer, producing smaller movement even when the global wind is strong.
	 */
	amplitude: number;

	/**
	 * Time offset, in seconds, applied to this tuft's wind sampling.
	 * Increase to make this tuft respond to an earlier/later phase of the wind pattern, separating its motion from nearby tufts.
	 * Decrease to bring its motion closer to the current shared wind phase, making it move more in sync with tufts that have similar lag.
	 */
	lag: number;
};

/** Hand-authored positions in the landscape's 1672 × 941 coordinate space. */
export const grassTufts = [
	{
		sprite: 8,
		x: 24,
		y: 925,
		scale: 0.54,
		stiffness: 0.82,
		amplitude: 0.9,
		lag: 0.25
	},
	{
		sprite: 5,
		x: 104,
		y: 934,
		scale: 0.39,
		stiffness: 1.08,
		amplitude: 0.72,
		lag: 0.08
	},
	{
		sprite: 0,
		x: 190,
		y: 918,
		scale: 0.46,
		stiffness: 0.92,
		amplitude: 0.85,
		lag: 0.12
	},
	{
		sprite: 14,
		x: 277,
		y: 940,
		scale: 0.5,
		stiffness: 1.15,
		amplitude: 0.68,
		lag: 0.07
	},
	{
		sprite: 11,
		x: 352,
		y: 926,
		scale: 0.42,
		stiffness: 0.88,
		amplitude: 0.95,
		lag: 0.16
	},
	{
		sprite: 2,
		x: 429,
		y: 939,
		scale: 0.55,
		stiffness: 1.2,
		amplitude: 0.62,
		lag: 0.04
	},
	{
		sprite: 9,
		x: 514,
		y: 922,
		scale: 0.43,
		stiffness: 0.78,
		amplitude: 1.04,
		lag: 0.18
	},
	{
		sprite: 6,
		x: 594,
		y: 941,
		scale: 0.46,
		stiffness: 1.12,
		amplitude: 0.7,
		lag: 0.2
	},
	{
		sprite: 1,
		x: 674,
		y: 924,
		scale: 0.4,
		stiffness: 0.7,
		amplitude: 1.1,
		lag: 0.28
	},
	{
		sprite: 12,
		x: 752,
		y: 936,
		scale: 0.47,
		stiffness: 1.04,
		amplitude: 0.76,
		lag: 0.11
	},
	{
		sprite: 10,
		x: 836,
		y: 921,
		scale: 0.43,
		stiffness: 0.84,
		amplitude: 0.96,
		lag: 0.05
	},
	{
		sprite: 7,
		x: 920,
		y: 939,
		scale: 0.45,
		stiffness: 1.16,
		amplitude: 0.66,
		lag: 0.1
	},
	{
		sprite: 3,
		x: 1002,
		y: 920,
		scale: 0.41,
		stiffness: 0.76,
		amplitude: 1.06,
		lag: 0.22
	},
	{
		sprite: 15,
		x: 1084,
		y: 940,
		scale: 0.48,
		stiffness: 1.05,
		amplitude: 0.74,
		lag: 0.2
	},
	{
		sprite: 4,
		x: 1165,
		y: 925,
		scale: 0.39,
		stiffness: 0.72,
		amplitude: 1.08,
		lag: 0.15
	},
	{
		sprite: 13,
		x: 1245,
		y: 938,
		scale: 0.43,
		stiffness: 0.9,
		amplitude: 0.88,
		lag: 0.24
	},
	{
		sprite: 0,
		x: 1325,
		y: 919,
		scale: 0.44,
		stiffness: 1.14,
		amplitude: 0.68,
		lag: 0.12
	},
	{
		sprite: 6,
		x: 1408,
		y: 941,
		scale: 0.45,
		stiffness: 0.96,
		amplitude: 0.82,
		lag: 0.2
	},
	{
		sprite: 11,
		x: 1489,
		y: 925,
		scale: 0.41,
		stiffness: 0.8,
		amplitude: 1,
		lag: 0.16
	},
	{
		sprite: 9,
		x: 1570,
		y: 936,
		scale: 0.4,
		stiffness: 1.1,
		amplitude: 0.7,
		lag: 0.18
	},
	{
		sprite: 14,
		x: 1648,
		y: 921,
		scale: 0.52,
		stiffness: 0.86,
		amplitude: 0.92,
		lag: 0.07
	},
	{
		sprite: 5,
		x: 125,
		y: 877,
		scale: 0.3,
		stiffness: 1.18,
		amplitude: 0.64,
		lag: 0.08
	},
	{
		sprite: 3,
		x: 786,
		y: 879,
		scale: 0.3,
		stiffness: 0.74,
		amplitude: 1.02,
		lag: 0.22
	},
	{
		sprite: 1,
		x: 1535,
		y: 874,
		scale: 0.3,
		stiffness: 0.68,
		amplitude: 1.08,
		lag: 0.28
	}
] satisfies GrassTuft[];
