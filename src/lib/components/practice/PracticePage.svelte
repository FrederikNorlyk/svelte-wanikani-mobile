<script lang="ts">
	import GridLayout from '$lib/components/layouts/GridLayout.svelte';
	import LevelsGrid from '$lib/components/practice/LevelsGrid.svelte';
	import LevelPage from '$lib/components/practice/LevelPage.svelte';
	import NavBar from '$lib/components/practice/NavBar.svelte';

	type PageState = 'select-level' | 'view-level';

	interface Props {
		onStartPractice: (subjectIds: number[]) => void;
		onCancel: () => void;
	}

	const { onStartPractice, onCancel }: Props = $props();

	let pageState = $state<PageState>('select-level');
	let selectedLevel = $state(0);
</script>

{#if pageState === 'select-level'}
	<GridLayout>
		{#snippet header()}
			<NavBar onBackButtonPressed={onCancel}>Levels</NavBar>
		{/snippet}
		<LevelsGrid
			onSelectLevel={(level) => {
				selectedLevel = level;
				pageState = 'view-level';
			}}
		/>
	</GridLayout>
{:else if pageState === 'view-level'}
	<LevelPage level={selectedLevel} {onStartPractice}>
		{#snippet header()}
			<NavBar
				onBackButtonPressed={() => {
					pageState = 'select-level';
				}}
			>
				Level {selectedLevel}
			</NavBar>
		{/snippet}
	</LevelPage>
{/if}
