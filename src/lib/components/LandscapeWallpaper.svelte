<script lang="ts">
	import { onMount } from 'svelte';
	import backgroundUrl from '$lib/assets/background/background.png';
	import atlasUrl from '$lib/assets/background/grass-atlas-clean.png';
	import { grassSprites, grassTufts } from '$lib/background/grassSprites';

	const SCENE_WIDTH = 1672;
	const SCENE_HEIGHT = 941;
	const MAX_PIXEL_RATIO = 2;
	const STATIC_WIND_TIME = 2.4;

	let canvas: HTMLCanvasElement;

	function windAt(time: number, worldX: number) {
		const travelingTime = time - worldX / SCENE_WIDTH;
		const baseline = Math.sin(travelingTime * 0.72) * 0.34;
		const irregularity = Math.sin(travelingTime * 0.23 + 1.7) * 0.2;
		const gustEnvelope = Math.max(0, Math.sin(travelingTime * 0.17 - 0.9)) ** 3;
		const gust = gustEnvelope * Math.sin(travelingTime * 0.58 + 0.4) * 0.46;

		return baseline + irregularity + gust;
	}

	function drawScene(
		context: CanvasRenderingContext2D,
		atlas: CanvasImageSource,
		time: number
	) {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
		const coverScale = Math.max(
			viewportWidth / SCENE_WIDTH,
			viewportHeight / SCENE_HEIGHT
		);
		const cropX = (viewportWidth - SCENE_WIDTH * coverScale) / 2;
		const cropY = viewportHeight - SCENE_HEIGHT * coverScale;

		const displayWidth = Math.round(viewportWidth * pixelRatio);
		const displayHeight = Math.round(viewportHeight * pixelRatio);
		if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
			canvas.width = displayWidth;
			canvas.height = displayHeight;
		}

		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		context.clearRect(0, 0, viewportWidth, viewportHeight);

		for (const tuft of grassTufts) {
			const sprite = grassSprites[tuft.sprite];
			const wind = windAt(time - tuft.lag, tuft.x) * tuft.amplitude;
			const bend = wind / tuft.stiffness;
			const spriteScale = tuft.scale * coverScale;
			const rootX = cropX + tuft.x * coverScale;
			const rootY = cropY + tuft.y * coverScale;

			context.save();
			context.translate(rootX + bend * 2.2 * coverScale, rootY);
			context.rotate(bend * 0.045);
			context.transform(1, 0, bend * 0.035, 1, 0, 0);
			context.drawImage(
				atlas,
				sprite.x,
				sprite.y,
				sprite.width,
				sprite.height,
				-sprite.rootX * spriteScale,
				-sprite.rootY * spriteScale,
				sprite.width * spriteScale,
				sprite.height * spriteScale
			);
			context.restore();
		}
	}

	onMount(() => {
		let context: CanvasRenderingContext2D | null;
		try {
			context = canvas.getContext('2d');
		} catch {
			return;
		}
		if (!context) return;

		let animationFrame: number | undefined;
		let elapsed = Math.random() * 90_000;
		let previousFrame: number | undefined;
		let disposed = false;
		let renderingFailed = false;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const atlas = new Image();

		const stopAnimation = () => {
			if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
			animationFrame = undefined;
		};

		const drawSafely = (time: number) => {
			if (renderingFailed) return false;
			try {
				drawScene(context, atlas, time);
				return true;
			} catch {
				renderingFailed = true;
				stopAnimation();
				context.clearRect(0, 0, canvas.width, canvas.height);
				return false;
			}
		};

		const render = (now: number) => {
			if (disposed) return;
			if (previousFrame !== undefined) elapsed += now - previousFrame;
			previousFrame = now;
			if (drawSafely(elapsed / 1000))
				animationFrame = requestAnimationFrame(render);
		};

		const drawStatic = () => drawSafely(STATIC_WIND_TIME);

		const startAnimation = () => {
			stopAnimation();
			previousFrame = undefined;
			animationFrame = requestAnimationFrame(render);
		};

		const updateAnimation = () => {
			if (renderingFailed || !atlas.complete || atlas.naturalWidth === 0)
				return;
			if (reducedMotion.matches) {
				stopAnimation();
				drawStatic();
			} else if (document.visibilityState === 'visible') {
				startAnimation();
			}
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'hidden') {
				stopAnimation();
			} else {
				updateAnimation();
			}
		};

		const handleResize = () => {
			if (reducedMotion.matches && atlas.complete) drawStatic();
		};

		atlas.addEventListener('load', updateAnimation, { once: true });
		atlas.src = atlasUrl;
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('resize', handleResize);
		reducedMotion.addEventListener('change', updateAnimation);

		return () => {
			disposed = true;
			stopAnimation();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('resize', handleResize);
			reducedMotion.removeEventListener('change', updateAnimation);
		};
	});
</script>

<div class="wallpaper" aria-hidden="true">
	<img alt="" src={backgroundUrl} />
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.wallpaper {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		pointer-events: none;
	}

	img,
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	img {
		object-fit: cover;
		object-position: center bottom;
	}

	@media (prefers-color-scheme: dark) {
		.wallpaper {
			filter: brightness(0.48) saturate(0.72) hue-rotate(8deg);
		}
	}
</style>
