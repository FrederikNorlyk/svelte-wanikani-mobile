<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { Toaster } from '$lib/shadcn/components/ui/sonner/index.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toaster position="top-center" />

<div class="box-border flex min-h-dvh flex-col space-y-2 p-5">
	{@render children()}
</div>
