<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/shadcn/utils';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<section
	class={cn(
		'paper-effect rounded-md border-2 border-(--card-border) p-8 text-(--card-foreground)',
		className
	)}
>
	{@render children()}
</section>

<style>
	section {
		--card-background: light-dark(#fff4d6, #172540);
		--card-foreground: light-dark(#624b38, #d4dced);
		--card-border: light-dark(#c8b58f, #52627d);
		--card-shadow-depth: light-dark(rgb(143 119 84 / 28%), rgb(2 8 24 / 55%));
		--card-shadow-glow: light-dark(rgb(255 128 0 / 14%), rgb(73 115 170 / 18%));

		--card-shadow-highlight: light-dark(
			rgb(255 255 255 / 70%),
			rgb(205 225 255 / 12%)
		);

		background:
			linear-gradient(220deg, rgb(255 255 255 / 4%), transparent 40%),
			var(--card-background);

		box-shadow:
			0 5px 0 var(--card-shadow-depth),
			0 10px 22px var(--card-shadow-glow),
			inset 0 1px 0 var(--card-shadow-highlight);
	}
</style>
