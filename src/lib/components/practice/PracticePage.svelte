<script lang="ts">
	import LevelsGrid from '$lib/components/practice/LevelsGrid.svelte';
	import LevelPage from '$lib/components/practice/LevelPage.svelte';
	import NavBar from '$lib/components/practice/NavBar.svelte';

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
	<NavBar onBackButtonPressed={onCancel}>Levels</NavBar>
	<LevelsGrid
		onSelectLevel={(level) => {
			selectedLevel = level;
			pageState = 'view-level';
		}}
	/>
{:else if pageState === 'view-level'}
	<NavBar
		onBackButtonPressed={() => {
			pageState = 'select-level';
		}}
	>
		Level {selectedLevel}
	</NavBar>
	<LevelPage level={selectedLevel} {onStartPractice} />
{/if}
