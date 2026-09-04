<script lang="ts">
	import { uiState } from '$lib/state/uiState.svelte';
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/shadcn/utils';

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

	let isAnimating = $state(false);

	async function animateButtonPress() {
		if (isAnimating) {
			return;
		}

		isAnimating = true;

		await new Promise((r) => setTimeout(r, 120));

		isAnimating = false;
	}

	onMount(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			const isModifierHeld = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;

			if (isModifierHeld) {
				return;
			}

			if (keyboardShortcut?.handler(e)) {
				e.preventDefault();

				animateButtonPress().then(() => {
					onclick();
				});
			}
		};

		window.addEventListener('keyup', onKeyUp, { passive: false });

		return () => window.removeEventListener('keyup', onKeyUp);
	});
</script>

<button
	class={cn(
		'paper-effect paper-effect__strong',
		'transition-transform duration-75 ease-out',
		isAnimating && 'translate-y-2 scale-[0.98]',
		className
	)}
	{onclick}
	type="button"
	{...restProps}
>
	{@render children()}
	{#if uiState.isShowingKeyboardShortcuts && keyboardShortcut?.hintElement}
		{@render keyboardShortcut.hintElement()}
	{/if}
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;

		min-height: 72px;
		padding: 0.9rem 1.8rem;

		border: 2px solid #bd493d;
		border-radius: 24px;

		background:
			linear-gradient(
				to bottom,
				rgba(255, 255, 255, 0.1),
				rgba(255, 255, 255, 0)
			),
			#e85d4d;

		color: #fffaf0;

		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: 0.01em;

		box-shadow:
			0 5px 0 #a83f35,
			0 8px 14px rgb(75 45 30 / 18%),
			inset 0 1px 0 rgb(255 255 255 / 30%);

		cursor: pointer;
		transition:
			transform 100ms ease,
			box-shadow 100ms ease,
			filter 150ms ease;
	}

	button:hover {
		filter: brightness(1.04);
		transform: translateY(-1px);

		box-shadow:
			0 6px 0 #a83f35,
			0 10px 16px rgb(75 45 30 / 20%),
			inset 0 1px 0 rgb(255 255 255 / 30%);
	}

	button:active {
		transform: translateY(4px);

		box-shadow:
			0 1px 0 #a83f35,
			0 4px 8px rgb(75 45 30 / 16%),
			inset 0 1px 0 rgb(255 255 255 / 22%);
	}

	button:focus-visible {
		outline: 3px solid rgb(255 255 255 / 85%);
		outline-offset: 4px;
	}
</style>
