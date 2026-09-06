<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { uiState } from '$lib/state/uiState.svelte';
	import SubjectCard from '$lib/components/SubjectCard.svelte';
	import type { Subject } from '$lib/functions/subjects.remote';
	import SubjectCharacter from '$lib/components/SubjectCharacter.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';

	interface Props {
		subject: Subject;
		isShowingAnswer: boolean;
	}

	const { subject, isShowingAnswer }: Props = $props();

	const primaryMeaning = $derived(subject.primaryMeaning);
	const primaryReading = $derived(subject.primaryReading);

	const subjectType = $derived.by(() => {
		switch (subject.type) {
			case 'radical':
				return 'Radical';
			case 'kanji':
				return 'Kanji';
			case 'kana_vocabulary':
			case 'vocabulary':
				return 'Vocabulary';
		}
	});
</script>

<a
	class="block"
	href={isShowingAnswer ? subject.documentUrl : undefined}
	rel="external"
	target="_blank"
>
	<SubjectCard class="min-h-60 gap-3" {subject}>
		<div class="top-row">
			<span class="flex-1">{subjectType}</span>

			{#if isShowingAnswer}
				<div class="flex gap-2">
					<ExternalLink class="inline-block size-5" />

					{#if uiState.isShowingKeyboardShortcuts}
						<Kbd class="shortcut-hint">f</Kbd>
					{/if}
				</div>
			{/if}
		</div>

		<div class="card-content">
			<div class="self-end">
				{#if isShowingAnswer && primaryReading}
					<p class="text-xl">{primaryReading}</p>
				{/if}
			</div>

			<SubjectCharacter class="text-5xl" {subject} />

			<div class="self-start">
				{#if isShowingAnswer && primaryMeaning}
					<p class="text-xl">{primaryMeaning}</p>
				{/if}
			</div>
		</div>
	</SubjectCard>
</a>

<style>
	@reference '../../../routes/layout.css';

	.top-row {
		@apply flex w-full items-center text-left text-lg font-medium;
	}

	.shortcut-hint {
		@apply inline-block bg-secondary-foreground text-secondary;
	}

	.card-content {
		@apply grid flex-1 grid-rows-[1fr_auto_1fr] items-center justify-items-center gap-2;
	}
</style>
