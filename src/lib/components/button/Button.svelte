<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getButtonClass, type ButtonStyleProps } from './buttonStyles.ts';
	import './button.css';

	type Props = Omit<HTMLButtonAttributes, 'children'> &
		ButtonStyleProps & {
			children: Snippet;
		};

	let {
		class: className,
		children,
		iconColor,
		size,
		buttonColor,
		...props
	}: Props = $props();

	const buttonClass = $derived(
		getButtonClass({ class: className, size, buttonColor, iconColor })
	);
</script>

<button class={buttonClass} {...props}>
	{@render children()}
</button>
