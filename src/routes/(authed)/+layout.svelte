<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte';

	let { children } = $props();
</script>

<NavBar />

<main class="flex flex-1 flex-col">
	{@render children()}
</main>
