<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		subject: Subject;
		children: Snippet;
	}

	const {
		class: className = '',
		subject,
		children,
		...restProps
	}: Props = $props();
</script>

<section
	class={className}
	class:kanji={subject.type === 'kanji'}
	class:radical={subject.type === 'radical'}
	class:vocab={subject.type === 'vocabulary' ||
		subject.type === 'kana_vocabulary'}
	{...restProps}
>
	{@render children()}
</section>

<style>
	@reference '../../routes/layout.css';

	section {
		/* svgs from WaniKani have a --color-text variable inside of them, that we can use to set the svg's color */
		--color-text: currentColor;

		--subject-card-background-highlight: light-dark(
			rgb(255 255 255 / 45%),
			rgb(255 255 255 / 5%)
		);

		--subject-card-shadow-highlight: light-dark(
			rgb(255 255 255 / 75%),
			rgb(255 255 255 / 10%)
		);

		&.kanji {
			--subject-card-background: light-dark(#fdd6eb, #460330);
			--subject-card-foreground: light-dark(#c60f64, #f9a8d4);
			--subject-card-border: light-dark(#f472b6, #db2777);
			--subject-card-shadow-depth: light-dark(
				rgb(190 24 93 / 20%),
				rgb(0 0 0 / 45%)
			);
			--subject-card-shadow-glow: light-dark(
				rgb(190 24 93 / 12%),
				rgb(244 114 182 / 12%)
			);
		}

		&.radical {
			--subject-card-background: light-dark(#c4dbfc, #112c52);
			--subject-card-foreground: light-dark(#1d4ed8, #93c5fd);
			--subject-card-border: light-dark(#60a5fa, #2563eb);
			--subject-card-shadow-depth: light-dark(
				rgb(29 78 216 / 20%),
				rgb(0 0 0 / 45%)
			);
			--subject-card-shadow-glow: light-dark(
				rgb(29 78 216 / 12%),
				rgb(96 165 250 / 12%)
			);
		}

		&.vocab {
			--subject-card-background: light-dark(#dfc6fc, #310c5d);
			--subject-card-foreground: light-dark(#7e22ce, #d8b4fe);
			--subject-card-border: light-dark(#c084fc, #9333ea);
			--subject-card-shadow-depth: light-dark(
				rgb(126 34 206 / 20%),
				rgb(0 0 0 / 45%)
			);
			--subject-card-shadow-glow: light-dark(
				rgb(126 34 206 / 12%),
				rgb(192 132 252 / 12%)
			);
		}

		@apply paper-effect flex flex-col items-center justify-center gap-2;
		@apply rounded-md border-2 p-6 text-center;

		color: var(--subject-card-foreground);
		border-color: color-mix(
			in srgb,
			var(--subject-card-foreground) 90%,
			transparent
		);

		background:
			linear-gradient(
				to bottom right,
				var(--subject-card-background-highlight),
				transparent 55%
			),
			var(--subject-card-background);

		box-shadow:
			0 4px 0 var(--subject-card-shadow-depth),
			0 10px 22px var(--subject-card-shadow-glow),
			inset 0 1px 0 var(--subject-card-shadow-highlight);
	}
</style>
