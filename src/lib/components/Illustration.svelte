<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		src: string;
		alt: string;
		children: Snippet;
	}

	const { src, alt, children }: Props = $props();
</script>

<img class="size-60" {src} {alt} />
<p class="text-lg">{@render children()}</p>
