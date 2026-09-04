<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import { onMount } from 'svelte';
	import { Toaster } from '$lib/shadcn/components/ui/sonner/index.js';

	let { children } = $props();

	const toasterOffset = {
		top: 'calc(2rem + env(safe-area-inset-top, 0px))',
		right: 'calc(2rem + env(safe-area-inset-right, 0px))',
		bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
		left: 'calc(2rem + env(safe-area-inset-left, 0px))'
	};

	const mobileToasterOffset = {
		top: 'calc(1rem + env(safe-area-inset-top, 0px))',
		right: 'calc(1rem + env(safe-area-inset-right, 0px))',
		bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
		left: 'calc(1rem + env(safe-area-inset-left, 0px))'
	};

	onMount(() => {
		const clearNotifications = async () => {
			const registration = await navigator.serviceWorker?.ready;

			if (!registration) {
				return;
			}

			const notifications = await registration.getNotifications();
			notifications.map((notification) => notification.close());
		};

		void clearNotifications();

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void clearNotifications();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});
</script>

<svelte:head>
	<link href={favicon} rel="icon" />
</svelte:head>

<!-- Global SVG filters -->
<svg
	style="position: absolute; pointer-events: none;"
	aria-hidden="true"
	height="0"
	width="0"
>
	<defs>
		<filter id="paper-noise">
			<feTurbulence
				baseFrequency="0.45"
				numOctaves="3"
				stitchTiles="stitch"
				type="fractalNoise"
			/>
			<feColorMatrix type="saturate" values="0" />
		</filter>
	</defs>
</svg>

<Toaster
	mobileOffset={mobileToasterOffset}
	offset={toasterOffset}
	position="top-center"
/>

<main class="box-border flex h-dvh min-h-0 flex-col gap-2">
	{@render children()}
</main>
