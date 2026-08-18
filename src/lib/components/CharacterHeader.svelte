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
	class={cn('character-header', className)}
	class:character-header--kanji={subject.type === 'kanji'}
	class:character-header--radical={subject.type === 'radical'}
	class:character-header--vocab={subject.type === 'vocabulary' ||
		subject.type === 'kana_vocabulary'}
	{...restProps}
>
	{@render children()}
</div>
