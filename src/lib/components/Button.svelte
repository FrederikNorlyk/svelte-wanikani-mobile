<script lang="ts">
	import * as Shadcn from '$lib/shadcn/components/ui/button';
	import { onMount, type Snippet } from 'svelte';
	import { cn } from '$lib/shadcn/utils';
	import { uiState } from '$lib/ui/uiState.svelte';

	export type Props = Shadcn.ButtonProps & {
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

<Shadcn.Button
	class={cn(
		'transition-transform duration-75 ease-out',
		isAnimating && 'translate-y-2 scale-[0.98]',
		className
	)}
	{onclick}
	{...restProps}
>
	{@render children()}
	{#if uiState.isShowingKeyboardShortcuts && keyboardShortcut?.hintElement}
		{@render keyboardShortcut.hintElement()}
	{/if}
</Shadcn.Button>
