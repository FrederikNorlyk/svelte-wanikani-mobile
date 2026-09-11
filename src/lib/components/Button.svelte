<script lang="ts">
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
		buttonColor: 'red' | 'sand';
		iconColor?: 'green' | 'yellow';
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
		iconColor,
		size,
		buttonColor,
		...actionProps
	}: Props = $props();

	const linkProps = $derived.by(() => {
		if (actionProps.onclick) {
			return;
		}

		const { disabled, href, ...attributes } = actionProps;

		return {
			...attributes,
			'aria-disabled': disabled || undefined,
			href: disabled ? undefined : href
		};
	});

	const buttonClass = $derived(
		cn(
			'button paper-effect inline-flex items-center justify-center gap-3 rounded-4xl border-2 border-(--button-border) font-bold tracking-wide text-(--button-foreground) no-underline [&_svg]:text-(--button-icon) [&_svg]:stroke-[2.2]',
			{
				'px-4 py-3 text-base [&_svg]:size-5': size === 'small',
				'px-5 py-4 text-xl  [&_svg]:size-7.5': size === 'medium',
				'px-5 py-4 text-2xl [&_svg]:size-11': size === 'large'
			},
			buttonColor,
			iconColor && `icon-${iconColor}`,
			className
		)
	);
</script>

{#if actionProps.onclick}
	<button class={buttonClass} {...actionProps} onclick={actionProps.onclick}>
		{@render children()}
	</button>
{:else}
	<a class={buttonClass} {...linkProps}>
		{@render children()}
	</a>
{/if}

<style>
	.button {
		--button-icon: var(--button-foreground);

		background:
			linear-gradient(
				to bottom,
				var(--button-background-highlight),
				rgb(255 255 255 / 0%)
			),
			var(--button-background);

		box-shadow:
			0 5px 0 var(--button-shadow-depth),
			0 8px 14px var(--button-shadow-drop),
			inset 0 1px 0 var(--button-shadow-highlight);
	}

	.red {
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

	.sand {
		--button-background: var(--background);
		--button-background-highlight: rgb(255 255 255 / 4%);
		--button-border: light-dark(#c8b58f, #52627d);
		--button-foreground: var(--foreground);
		--button-shadow-depth: light-dark(#e0d1b2, #0b152a);
		--button-shadow-drop: light-dark(
			rgb(255 128 0 / 14%),
			rgb(73 115 170 / 18%)
		);
		--button-shadow-highlight: light-dark(
			rgb(255 255 255 / 70%),
			rgb(205 225 255 / 12%)
		);
		--button-focus-outline: var(--foreground);
	}

	.icon-green {
		--button-icon: light-dark(#668355, #77a860);
	}

	.icon-yellow {
		--button-icon: light-dark(#d49a1d, #e6bd55);
	}

	.button:not(:disabled):not([aria-disabled='true']):hover {
		filter: brightness(1.04);

		box-shadow:
			0 6px 0 var(--button-shadow-depth),
			0 10px 16px var(--button-shadow-drop-hover, var(--button-shadow-drop)),
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
