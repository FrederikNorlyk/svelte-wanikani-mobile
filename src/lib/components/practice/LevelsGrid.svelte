<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { Progress } from '$lib/shadcn/components/ui/progress/index';
	import SubjectsRepository from '$lib/repository/database/subjectsRepository';
	import ProgressRepository from '$lib/repository/database/progressRepository';
	import { calculatePercentage } from '$lib/util/mathUtil';
	import { cn } from '$lib/shadcn/utils';
	import UserRepository from '$lib/repository/local-storage/userRepository';
	import ScrollableGrid from '$lib/components/practice/ScrollableGrid.svelte';
	import { onMount } from 'svelte';

	interface Props {
		onSelectLevel: (level: number) => void;
	}

	const { onSelectLevel }: Props = $props();

	let maxLevelGranted = $state(0);
	let subjectCounts = $state<Record<number, number>>([]);
	let progressCounts = $state<Record<number, number>>([]);

	onMount(() => {
		UserRepository.getUser().then(
			(user) => (maxLevelGranted = user.maxLevelGranted)
		);

		Promise.all([
			SubjectsRepository.countAllLevels(),
			ProgressRepository.countAllLevels()
		]).then(([s, p]) => {
			subjectCounts = s;
			progressCounts = p;
		});
	});
</script>

<ScrollableGrid>
	{#each Array.from({ length: 60 }, (_, i) => i + 1) as level (level)}
		{@const completed = progressCounts[level] ?? 0}
		{@const total = subjectCounts[level] ?? 1}

		<Button
			class="relative w-full"
			disabled={maxLevelGranted < level}
			onclick={() => onSelectLevel(level)}
			size="lg"
			variant="outline"
		>
			<Progress
				class={cn('absolute bottom-0 rounded-t-none', {
					"**:data-[slot='progress-indicator']:bg-amber-300":
						completed === total
				})}
				value={calculatePercentage(completed, total)}
			/>
			{level}
		</Button>
	{/each}
</ScrollableGrid>
