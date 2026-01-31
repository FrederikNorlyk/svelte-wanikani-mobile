<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		src: string;
		alt: string;
		children: Snippet;
	}

	const { src, alt, children }: Props = $props();

	let loaded = $state(false);

	function markLoaded() {
		loaded = true;
	}
</script>

<img
	class="size-60 transition-opacity duration-1000"
	class:opacity-0={!loaded}
	class:opacity-100={loaded}
	{src}
	{alt}
	loading="lazy"
	decoding="async"
	onload={markLoaded}
/>

<p class="text-lg">{@render children()}</p>
