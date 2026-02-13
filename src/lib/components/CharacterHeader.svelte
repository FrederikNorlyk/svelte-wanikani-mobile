<script lang="ts">
	import type { Subject } from '$lib/functions/subjects.remote';
	import { cn } from '$lib/shadcn/utils';

	interface Props {
		class?: string;
		subject: Subject;
	}

	const { class: className = '', subject, ...restProps }: Props = $props();
</script>

<h1
	class={cn('character-header', className)}
	class:character-header--kanji={subject.type === 'kanji'}
	class:character-header--radical={subject.type === 'radical'}
	class:character-header--vocab={subject.type === 'vocabulary' ||
		subject.type === 'kana_vocabulary'}
	{...restProps}
>
	{subject.characters}
</h1>
