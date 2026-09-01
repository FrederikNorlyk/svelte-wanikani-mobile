export type GrassSprite = {
	x: number;
	y: number;
	width: number;
	height: number;
	rootX: number;
	rootY: number;
};

/** Authored rectangles and root pivots in the original 1254 × 1254 atlas. */
export const grassSprites = [
	{ x: 34, y: 18, width: 276, height: 294, rootX: 138, rootY: 292 },
	{ x: 344, y: 16, width: 310, height: 297, rootX: 155, rootY: 295 },
	{ x: 648, y: 139, width: 295, height: 174, rootX: 148, rootY: 172 },
	{ x: 951, y: 24, width: 289, height: 293, rootX: 145, rootY: 291 },
	{ x: 0, y: 338, width: 345, height: 275, rootX: 173, rootY: 273 },
	{ x: 367, y: 386, width: 248, height: 227, rootX: 124, rootY: 225 },
	{ x: 645, y: 411, width: 328, height: 202, rootX: 164, rootY: 200 },
	{ x: 978, y: 337, width: 260, height: 276, rootX: 130, rootY: 274 },
	{ x: 15, y: 748, width: 295, height: 148, rootX: 148, rootY: 146 },
	{ x: 335, y: 624, width: 266, height: 270, rootX: 133, rootY: 268 },
	{ x: 632, y: 656, width: 357, height: 236, rootX: 179, rootY: 234 },
	{ x: 1028, y: 658, width: 214, height: 239, rootX: 107, rootY: 237 },
	{ x: 13, y: 947, width: 313, height: 262, rootX: 157, rootY: 260 },
	{ x: 342, y: 914, width: 312, height: 296, rootX: 156, rootY: 294 },
	{ x: 683, y: 995, width: 285, height: 209, rootX: 143, rootY: 207 },
	{ x: 978, y: 914, width: 269, height: 296, rootX: 135, rootY: 294 }
] satisfies GrassSprite[];

export type GrassTuft = {
	sprite: number;
	x: number;
	y: number;
	scale: number;
	stiffness: number;
	amplitude: number;
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
		lag: 0.08
	},
	{
		sprite: 5,
		x: 104,
		y: 934,
		scale: 0.39,
		stiffness: 1.08,
		amplitude: 0.72,
		lag: 0.16
	},
	{
		sprite: 0,
		x: 190,
		y: 918,
		scale: 0.46,
		stiffness: 0.92,
		amplitude: 0.85,
		lag: 0.24
	},
	{
		sprite: 14,
		x: 277,
		y: 940,
		scale: 0.5,
		stiffness: 1.15,
		amplitude: 0.68,
		lag: 0.31
	},
	{
		sprite: 11,
		x: 352,
		y: 926,
		scale: 0.42,
		stiffness: 0.88,
		amplitude: 0.95,
		lag: 0.38
	},
	{
		sprite: 2,
		x: 429,
		y: 939,
		scale: 0.55,
		stiffness: 1.2,
		amplitude: 0.62,
		lag: 0.46
	},
	{
		sprite: 9,
		x: 514,
		y: 922,
		scale: 0.43,
		stiffness: 0.78,
		amplitude: 1.04,
		lag: 0.54
	},
	{
		sprite: 6,
		x: 594,
		y: 941,
		scale: 0.46,
		stiffness: 1.12,
		amplitude: 0.7,
		lag: 0.61
	},
	{
		sprite: 1,
		x: 674,
		y: 924,
		scale: 0.4,
		stiffness: 0.7,
		amplitude: 1.1,
		lag: 0.69
	},
	{
		sprite: 12,
		x: 752,
		y: 936,
		scale: 0.47,
		stiffness: 1.04,
		amplitude: 0.76,
		lag: 0.76
	},
	{
		sprite: 10,
		x: 836,
		y: 921,
		scale: 0.43,
		stiffness: 0.84,
		amplitude: 0.96,
		lag: 0.84
	},
	{
		sprite: 7,
		x: 920,
		y: 939,
		scale: 0.45,
		stiffness: 1.16,
		amplitude: 0.66,
		lag: 0.91
	},
	{
		sprite: 3,
		x: 1002,
		y: 920,
		scale: 0.41,
		stiffness: 0.76,
		amplitude: 1.06,
		lag: 0.99
	},
	{
		sprite: 15,
		x: 1084,
		y: 940,
		scale: 0.48,
		stiffness: 1.05,
		amplitude: 0.74,
		lag: 1.07
	},
	{
		sprite: 4,
		x: 1165,
		y: 925,
		scale: 0.39,
		stiffness: 0.72,
		amplitude: 1.08,
		lag: 1.14
	},
	{
		sprite: 13,
		x: 1245,
		y: 938,
		scale: 0.43,
		stiffness: 0.9,
		amplitude: 0.88,
		lag: 1.22
	},
	{
		sprite: 0,
		x: 1325,
		y: 919,
		scale: 0.44,
		stiffness: 1.14,
		amplitude: 0.68,
		lag: 1.3
	},
	{
		sprite: 6,
		x: 1408,
		y: 941,
		scale: 0.45,
		stiffness: 0.96,
		amplitude: 0.82,
		lag: 1.37
	},
	{
		sprite: 11,
		x: 1489,
		y: 925,
		scale: 0.41,
		stiffness: 0.8,
		amplitude: 1,
		lag: 1.45
	},
	{
		sprite: 9,
		x: 1570,
		y: 936,
		scale: 0.4,
		stiffness: 1.1,
		amplitude: 0.7,
		lag: 1.52
	},
	{
		sprite: 14,
		x: 1648,
		y: 921,
		scale: 0.52,
		stiffness: 0.86,
		amplitude: 0.92,
		lag: 1.6
	},
	{
		sprite: 5,
		x: 125,
		y: 877,
		scale: 0.3,
		stiffness: 1.18,
		amplitude: 0.64,
		lag: 0.19
	},
	{
		sprite: 3,
		x: 786,
		y: 879,
		scale: 0.3,
		stiffness: 0.74,
		amplitude: 1.02,
		lag: 0.8
	},
	{
		sprite: 1,
		x: 1535,
		y: 874,
		scale: 0.3,
		stiffness: 0.68,
		amplitude: 1.08,
		lag: 1.49
	}
] satisfies GrassTuft[];
