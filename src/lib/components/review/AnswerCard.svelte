<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import type { LucideIcon } from '@lucide/svelte';

	interface Props {
		label: string;
		answers: string[];
		icon: LucideIcon;
	}

	const { label, answers, icon: Icon }: Props = $props();
</script>

<Card class="flex items-center gap-4 px-6 py-4">
	<Icon size={30} />
	<div>
		<p class="text-lg font-medium">{label}</p>

		<div class="answers">
			{#each answers as answer (answer)}
				<p class="inline-block text-lg">{answer}</p>
			{/each}
		</div>
	</div>
</Card>

<style>
	@reference '../../../routes/layout.css';

	/* Separate each answer with a dot */
	.answers > p + p::before {
		@apply mx-1 font-medium;

		content: '·';
	}
</style>
