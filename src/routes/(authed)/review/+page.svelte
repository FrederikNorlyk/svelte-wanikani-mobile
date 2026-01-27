<script lang="ts">
	import { type Assignment, getAllAssignments } from '$lib/functions/assignments.remote';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import type { Subject } from '$lib/functions/subjects.remote';
	import Review from '$lib/components/Review.svelte';

	let isLoading = $state(true);
	let assignments = $state<Assignment[]>([]);
	let currentAssignment = $state<Assignment | undefined>(undefined);
	let currentSubject = $state<Subject | undefined>(undefined);

	onMount(async () => {
		try {
			assignments = await getAllAssignments();
			await getNextSubject();
		} catch {
			toast.error('Something went wrong');
			return;
		} finally {
			isLoading = false;
		}
	});

	async function getNextSubject() {
		currentAssignment = assignments.shift();

		if (currentAssignment) {
			currentSubject = await SubjectsRepository.getSubject(currentAssignment.subjectId);

			if (!currentSubject) {
				toast.error(`Could not get subject #${currentAssignment.subjectId}`);
			}
		} else {
			currentSubject = undefined;
		}
	}
</script>

<div class="flex min-h-full flex-1 flex-col">
	{#if isLoading}
		Loading...
	{:else if !currentSubject}
		You have no pending reviews.
	{:else}
		<Review
			subject={currentSubject}
			onCorrectAnswer={getNextSubject}
			onWrongAnswer={getNextSubject}
		/>
	{/if}
</div>
