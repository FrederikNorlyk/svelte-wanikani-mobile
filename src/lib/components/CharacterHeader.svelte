<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SubjectType } from '$lib/types/subjectType';

	interface Props {
		type: SubjectType;
		children: Snippet;
	}

	const { type, children }: Props = $props();
</script>

<h1
	class="character-header"
	class:character-header--kanji={type === 'kanji'}
	class:character-header--radical={type === 'radical'}
	class:character-header--vocab={type === 'vocabulary' ||
		type === 'kana_vocabulary'}
>
	{@render children()}
</h1>
