<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { cn } from '$lib/shadcn/utils';
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

<div
	class={cn('subject-card', className)}
	class:subject-card--kanji={subject.type === 'kanji'}
	class:subject-card--radical={subject.type === 'radical'}
	class:subject-card--vocab={subject.type === 'vocabulary' ||
		subject.type === 'kana_vocabulary'}
	{...restProps}
>
	{@render children()}
</div>
