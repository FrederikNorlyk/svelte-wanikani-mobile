<script lang="ts">
	import {
		Field,
		FieldDescription,
		FieldLabel
	} from '$lib/shadcn/components/ui/field';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/shadcn/components/ui/select';
	import { type SubjectType, subjectTypes } from '$lib/types/subjectType';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import SubjectsRepository from '$lib/repository/subjectsRepository';
	import { studySession } from '$lib/state/studySession.svelte';

	interface Props {
		onStartPractice: () => void;
	}

	const { onStartPractice }: Props = $props();

	let selectedTypes = $state<SubjectType[]>([]);

	const types = subjectTypes.map((subjectType) => {
		let label;
		switch (subjectType) {
			case 'radical':
				label = 'Radicals';
				break;
			case 'kana_vocabulary':
				label = 'Kana vocabulary';
				break;
			case 'vocabulary':
				label = 'Vocabulary';
				break;
			case 'kanji':
				label = 'Kanji';
				break;
		}

		return { value: subjectType, label: label };
	});

	const subjectLabel = $derived.by(() => {
		if (selectedTypes.length === 0) {
			return 'Choose type';
		} else if (selectedTypes.length === types.length) {
			return 'Everything';
		} else if (selectedTypes.length === 1) {
			return types.find((t) => t.value === selectedTypes[0])?.label ?? 'Error';
		}
		return 'Several things';
	});

	async function buildPracticeSession() {
		// TODO: Use actual offset and limit
		const allSubjects = await SubjectsRepository.getSubjectsByType(
			selectedTypes[0]
		);

		// Pick 5 unique random subjects (or fewer if not enough available)
		const shuffled = [...allSubjects].sort(() => Math.random() - 0.5);
		studySession.subjects = shuffled.slice(0, Math.min(5, allSubjects.length));

		studySession.index = 0;
	}
</script>

<div class="w-full max-w-md">
	<Field>
		<FieldLabel for="type">Type</FieldLabel>
		<FieldDescription>Select what to practice.</FieldDescription>
		<Select type="multiple" bind:value={selectedTypes}>
			<SelectTrigger id="type">
				{subjectLabel}
			</SelectTrigger>
			<SelectContent>
				{#each types as option (option.value)}
					<SelectItem {...option} />
				{/each}
			</SelectContent>
		</Select>
	</Field>
</div>

<Button
	keyboardShortcut={{
		handler: (e) => e.code === 'Space',
		hintElement: spacebarShortcut
	}}
	onclick={() => {
		buildPracticeSession().then(onStartPractice);
	}}
>
	Start
</Button>

{#snippet spacebarShortcut()}
	<Kbd>Space</Kbd>
{/snippet}
