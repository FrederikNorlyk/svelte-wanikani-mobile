import { cn } from '$lib/shadcn/utils';

export type ButtonStyleProps = {
	class?: string;
	size: 'small' | 'medium' | 'large';
	buttonColor: 'red' | 'sand';
	iconColor?: 'green' | 'yellow';
};

export function getButtonClass({
	class: className,
	size,
	buttonColor,
	iconColor
}: ButtonStyleProps) {
	return cn(
		'button paper-effect inline-flex items-center justify-center gap-3 rounded-4xl border-2 border-(--button-border) font-bold tracking-wide text-(--button-foreground) no-underline [&_svg]:text-(--button-icon) [&_svg]:stroke-[2.2]',
		{
			'px-4 py-3 text-base [&_svg]:size-5': size === 'small',
			'px-5 py-4 text-xl [&_svg]:size-7.5': size === 'medium',
			'px-5 py-4 text-2xl [&_svg]:size-11': size === 'large'
		},
		buttonColor,
		iconColor && `icon-${iconColor}`,
		className
	);
}
