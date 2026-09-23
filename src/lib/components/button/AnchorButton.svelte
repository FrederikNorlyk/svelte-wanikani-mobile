<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { getButtonClass, type ButtonStyleProps } from './buttonStyles.ts';
	import './button.css';

	type Props = Omit<HTMLAnchorAttributes, 'children' | 'href'> &
		ButtonStyleProps & {
			children: Snippet;
			disabled?: boolean;
			href: string;
		};

	let {
		class: className,
		children,
		disabled = false,
		href,
		iconColor,
		size,
		buttonColor,
		...props
	}: Props = $props();

	const buttonClass = $derived(
		getButtonClass({ class: className, size, buttonColor, iconColor })
	);

	const anchorProps = $derived({
		...props,
		'aria-disabled': disabled || undefined,
		href: disabled ? undefined : href
	});
</script>

<a class={buttonClass} {...anchorProps}>
	{@render children()}
</a>
