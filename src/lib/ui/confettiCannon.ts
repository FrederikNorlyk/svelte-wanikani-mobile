import confetti from 'canvas-confetti';

/*
 Height of each volley of confetti.
 */
const CONFETTI_ZONE_PX = 300;
const FIRING_INTERVAL_MS = 150;
const PARTICLE_COUNT = 90;
const SPREAD = 60;
const COLORS = ['#00FF00', '#00FFFF', '#FF00FF', '#800080', '#FFA500'];

export default class ConfettiCannon {
	private isRunning = true;

	public fire() {
		const viewportHeight = globalThis.innerHeight;
		const numberOfBursts = Math.ceil(viewportHeight / CONFETTI_ZONE_PX);

		for (let i = 0; i < numberOfBursts; i++) {
			setTimeout(() => {
				const yPx = viewportHeight - i * CONFETTI_ZONE_PX;

				// normalize to 0..1
				const y = Math.min(1, Math.max(0, yPx / viewportHeight));

				const placements = [
					{
						angle: 60,
						x: -0.2
					},
					{
						angle: 120,
						x: 1.2
					}
				];

				for (const placement of placements) {
					confetti({
						particleCount: PARTICLE_COUNT,
						spread: SPREAD,
						angle: placement.angle,
						origin: { x: placement.x, y },
						startVelocity: 40,
						gravity: 0.7,
						colors: COLORS
					});
				}
			}, i * FIRING_INTERVAL_MS);
		}

		setTimeout(() => {
			this.startSlowlyFallingParticles();
		}, numberOfBursts * FIRING_INTERVAL_MS);
	}

	public stop() {
		confetti.reset();
		this.isRunning = false;
	}

	private startSlowlyFallingParticles() {
		let skew = 1;
		let last = performance.now();
		const intervalBetweenParticlesMs = 100;

		const frame = (now: number) => {
			if (now - last >= intervalBetweenParticlesMs) {
				last = now;
				skew = Math.max(0.8, skew - 0.0005);

				confetti({
					particleCount: 1,
					startVelocity: 0,
					ticks: 500, // lifetime of each particle
					origin: {
						x: Math.random(),
						y: Math.random() * skew - 0.2
					},
					gravity: ConfettiCannon.randomNumberBetween(0.15, 0.35),
					colors: [ConfettiCannon.randomColor()]
				});
			}

			if (this.isRunning) {
				requestAnimationFrame(frame);
			}
		};

		requestAnimationFrame(frame);
	}

	private static randomColor() {
		return COLORS[Math.floor(Math.random() * COLORS.length)];
	}

	private static randomNumberBetween(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}
}
