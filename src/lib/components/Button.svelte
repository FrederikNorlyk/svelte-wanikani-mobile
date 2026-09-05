<script lang="ts">
	import { uiState } from '$lib/state/uiState.svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		children: Snippet;
		keyboardShortcut?: {
			handler: (e: KeyboardEvent) => boolean;
			hintElement: Snippet;
		};
		onclick: () => void;
	};

	const {
		class: className,
		children,
		keyboardShortcut,
		onclick,
		...restProps
	}: Props = $props();

	let buttonElement: HTMLButtonElement;

	async function animateButtonPress() {
		const animation = buttonElement.animate(
			[
				{ transform: 'translateY(0)' },
				{ transform: 'translateY(4px)' },
				{ transform: 'translateY(0)' }
			],
			{ duration: 50, easing: 'ease-out' }
		);

		await animation.finished;
	}

	onMount(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			const isModifierHeld = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;

			if (isModifierHeld) {
				return;
			}

			if (keyboardShortcut?.handler(e)) {
				e.preventDefault();
				buttonElement.click();
			}
		};

		window.addEventListener('keyup', onKeyUp, { passive: false });

		return () => window.removeEventListener('keyup', onKeyUp);
	});
</script>

<button
	bind:this={buttonElement}
	class={className}
	onclick={() => {
		animateButtonPress().then(onclick);
	}}
	type="button"
	{...restProps}
>
	{@render children()}

	{#if uiState.isShowingKeyboardShortcuts && keyboardShortcut?.hintElement}
		{@render keyboardShortcut.hintElement()}
	{/if}
</button>

<style>
	@reference '../../routes/layout.css';

	button {
		--button-background: light-dark(#e85d4d, #c84f43);

		--button-background-highlight: light-dark(
			rgb(255 255 255 / 10%),
			rgb(255 255 255 / 6%)
		);

		--button-background-highlight-transparent: rgb(255 255 255 / 0%);
		--button-border: light-dark(#bd493d, #a33f36);
		--button-foreground: #fffaf0;
		--button-shadow-depth: light-dark(#a83f35, #84332c);
		--button-shadow-drop: light-dark(rgb(75 45 30 / 18%), rgb(0 0 0 / 28%));

		--button-shadow-drop-hover: light-dark(
			rgb(75 45 30 / 20%),
			rgb(0 0 0 / 32%)
		);

		--button-shadow-highlight: light-dark(
			rgb(255 255 255 / 30%),
			rgb(255 255 255 / 16%)
		);

		--button-focus-outline: rgb(255 255 255 / 85%);

		@apply paper-effect;
		@apply inline-flex items-center justify-center gap-3;
		@apply rounded-4xl border-2 border-(--button-border);
		@apply px-10 py-5;
		@apply text-xl font-bold tracking-wide text-(--button-foreground);

		@apply [&_svg]:size-7.5 [&_svg]:stroke-[2.2];

		background:
			linear-gradient(
				to bottom,
				var(--button-background-highlight),
				var(--button-background-highlight-transparent)
			),
			var(--button-background);

		box-shadow:
			0 5px 0 var(--button-shadow-depth),
			0 8px 14px var(--button-shadow-drop),
			inset 0 1px 0 var(--button-shadow-highlight);

		transition:
			transform 100ms ease,
			box-shadow 100ms ease,
			filter 150ms ease;
	}

	button:hover {
		filter: brightness(1.04);
		transform: translateY(-1px);

		box-shadow:
			0 6px 0 var(--button-shadow-depth),
			0 10px 16px var(--button-shadow-drop-hover),
			inset 0 1px 0 var(--button-shadow-highlight);
	}

	button:focus-visible {
		outline: 3px solid var(--button-focus-outline);
		outline-offset: 4px;
	}
</style>
