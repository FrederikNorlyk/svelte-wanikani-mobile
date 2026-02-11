<script lang="ts">
	import LevelsGrid from '$lib/components/practice/LevelsGrid.svelte';
	import LevelPage from '$lib/components/practice/LevelPage.svelte';
	import Button from '$lib/components/Button.svelte';

	type PageState = 'select-level' | 'view-level';

	interface Props {
		onStartPractice: () => void;
		onCancel: () => void;
	}

	const { onStartPractice, onCancel }: Props = $props();

	let pageState = $state<PageState>('select-level');
	let selectedLevel = $state(0);
</script>

{#if pageState === 'select-level'}
	<div class="flex gap-2">
		<Button onclick={onCancel}>Back</Button>
		<h1 class="text-2xl">Levels</h1>
	</div>
	<LevelsGrid
		onSelectLevel={(level) => {
			selectedLevel = level;
			pageState = 'view-level';
		}}
	/>
{:else if pageState === 'view-level'}
	<div class="flex gap-2">
		<Button
			onclick={() => {
				pageState = 'select-level';
			}}>Back</Button
		>
		<h1 class="text-2xl">Level {selectedLevel}</h1>
	</div>
	<LevelPage level={selectedLevel} {onStartPractice} />
{/if}
