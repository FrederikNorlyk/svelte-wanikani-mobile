<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	import { Toaster } from '$lib/shadcn/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head>
	<link href={favicon} rel="icon" />
</svelte:head>

<Toaster position="top-center" />

<main class="box-border flex h-dvh min-h-0 flex-col gap-2">
	{@render children()}
</main>
