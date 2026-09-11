<script lang="ts">
	import { uiState } from '$lib/state/uiState.svelte';
	import { type Snippet } from 'svelte';
	import type {
		HTMLAnchorAttributes,
		HTMLButtonAttributes
	} from 'svelte/elements';
	import { cn } from '$lib/shadcn/utils';

	type CommonProps = {
		class?: string;
		children: Snippet;
		size: 'small' | 'medium' | 'large';
		variant: 'primary' | 'secondary';
		keyboardShortcut?: {
			handler: (e: KeyboardEvent) => boolean;
			hintElement: Snippet;
		};
	};

	type ButtonProps = Omit<
		HTMLButtonAttributes,
		keyof CommonProps | 'onclick'
	> & {
		href?: never;
		onclick: () => void;
	};

	type LinkProps = Omit<HTMLAnchorAttributes, keyof CommonProps | 'onclick'> & {
		disabled?: boolean;
		href: string;
		onclick?: never;
	};

	type Props = CommonProps & (ButtonProps | LinkProps);

	let {
		class: className,
		children,
		keyboardShortcut,
		size,
		variant,
		...actionProps
	}: Props = $props();

	const linkProps = $derived.by(() => {
		if (actionProps.onclick) return;

		const { disabled, href, ...attributes } = actionProps;

		return {
			...attributes,
			'aria-disabled': disabled || undefined,
			href: disabled ? undefined : href
		};
	});

	const buttonClass = $derived(
		cn(
			'button paper-effect inline-flex items-center justify-center gap-3 rounded-4xl border-2 border-(--button-border) font-bold tracking-wide text-(--button-foreground) [&_svg]:stroke-[2.2]',
			{
				'px-4 py-3 text-base [&_svg]:size-5': size === 'small',
				'px-5 py-4 text-xl  [&_svg]:size-7.5': size === 'medium',
				'px-5 py-4 text-2xl [&_svg]:size-10': size === 'large'
			},
			variant,
			className
		)
	);
</script>

{#snippet content()}
	{@render children()}

	{#if uiState.isShowingKeyboardShortcuts && keyboardShortcut?.hintElement}
		{@render keyboardShortcut.hintElement()}
	{/if}
{/snippet}

{#if actionProps.onclick}
	<button class={buttonClass} {...actionProps} onclick={actionProps.onclick}>
		{@render content()}
	</button>
{:else}
	<a class={buttonClass} {...linkProps}>
		{@render content()}
	</a>
{/if}

<style>
	@reference '../../routes/layout.css';

	.button {
		--button-background-highlight-transparent: rgb(255 255 255 / 0%);

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

		text-decoration: none;
	}

	.primary {
		--button-background: light-dark(#e85d4d, #c84f43);

		--button-background-highlight: light-dark(
			rgb(255 255 255 / 10%),
			rgb(255 255 255 / 6%)
		);

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
	}

	.secondary {
		--button-background: var(--background);
		--button-background-highlight: rgb(255 255 255 / 4%);
		--button-border: light-dark(#c8b58f, #52627d);
		--button-foreground: var(--foreground);
		--button-shadow-depth: light-dark(#e0d1b2, #0b152a);
		--button-shadow-drop: light-dark(
			rgb(255 128 0 / 14%),
			rgb(73 115 170 / 18%)
		);
		--button-shadow-drop-hover: light-dark(
			rgb(255 128 0 / 14%),
			rgb(73 115 170 / 18%)
		);
		--button-shadow-highlight: light-dark(
			rgb(255 255 255 / 70%),
			rgb(205 225 255 / 12%)
		);
		--button-focus-outline: var(--foreground);
	}

	.button:not(:disabled):not([aria-disabled='true']):hover {
		filter: brightness(1.04);
		transform: translateY(-1px);

		box-shadow:
			0 6px 0 var(--button-shadow-depth),
			0 10px 16px var(--button-shadow-drop-hover),
			inset 0 1px 0 var(--button-shadow-highlight);
	}

	a[aria-disabled='true'] {
		cursor: default;
	}

	.button:focus-visible {
		outline: 3px solid var(--button-focus-outline);
		outline-offset: 4px;
	}
</style>
