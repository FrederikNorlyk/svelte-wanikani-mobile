<script lang="ts">
	import type { Snippet } from 'svelte';
	import GridLayout from '$lib/components/layouts/GridLayout.svelte';
	import ProgressRepository, {
		type Progress
	} from '$lib/repository/database/progressRepository';
	import SubjectsRepository from '$lib/repository/database/subjectsRepository';
	import type { Subject } from '$lib/functions/subjects.remote';
	import { setStudySession } from '$lib/state/studySession.svelte';
	import Button from '$lib/components/button/Button.svelte';
	import { cn } from '$lib/shadcn/utils';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/shadcn/components/ui/alert-dialog';
	import ScrollableGrid from '$lib/components/practice/ScrollableGrid.svelte';
	import SubjectCard from '../SubjectCard.svelte';
	import SubjectCharacter from '$lib/components/SubjectCharacter.svelte';

	interface Props {
		header: Snippet;
		level: number;
		onStartPractice: () => void;
	}

	const { header, level, onStartPractice }: Props = $props();

	let progress = $state<Progress[]>([]);
	let subjects = $state<Subject[]>([]);
	let refreshCounter = $state(0);
	let isShowingAlertDialog = $state(false);

	const isLevelCompleted = $derived(subjects.length === progress.length);

	$effect(() => {
		void refreshCounter; // Track changes
		let cancelled = false;

		Promise.all([
			ProgressRepository.getByLevel(level),
			SubjectsRepository.getSubjectsByLevel(level)
		]).then(([p, s]) => {
			if (cancelled) {
				return;
			}

			progress = p;
			subjects = s;
		});

		return () => {
			cancelled = true;
		};
	});

	async function buildPracticeSession() {
		const remainingSubjects = subjects.filter(
			(subject) => !progress.find((p) => p.subjectId === subject.id)
		);

		setStudySession({
			subjectIds: remainingSubjects.map((subject) => subject.id),
			index: 0,
			studyType: 'practice',
			numberOfCorrectAnswers: 0
		});
	}
</script>

<GridLayout {header}>
	{#snippet controls()}
		<Button
			buttonColor="red"
			onclick={() => {
				if (isLevelCompleted) {
					isShowingAlertDialog = true;
				} else {
					buildPracticeSession().then(onStartPractice);
				}
			}}
			size="medium"
		>
			{isLevelCompleted ? 'Reset' : 'Start'}
		</Button>
	{/snippet}
	<ScrollableGrid>
		{#each subjects as subject (subject.id)}
			{@const isCompleted = progress.find((p) => p.subjectId === subject.id)}

			<a href={subject.documentUrl} rel="external" target="_blank">
				<SubjectCard class={cn('', { 'opacity-50': isCompleted })} {subject}>
					<SubjectCharacter {subject} />
				</SubjectCard>
			</a>
		{/each}
	</ScrollableGrid>
</GridLayout>

<AlertDialog bind:open={isShowingAlertDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription
				>This action will reset all progress in level <b>{level}</b
				>.</AlertDialogDescription
			>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel class="h-12">Cancel</AlertDialogCancel>
			<AlertDialogAction
				class="h-12"
				onclick={() =>
					ProgressRepository.deleteByLevel(level).then(() => {
						refreshCounter += 1;
						isShowingAlertDialog = false;
					})}
				>Reset
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
