<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import slump_good_man_study from '$lib/assets/irasutoya/slump_good_man_study.png';
	import study_night_boy from '$lib/assets/irasutoya/study_night_boy.png';
	import study_chienetsu_boy from '$lib/assets/irasutoya/study_chienetsu_boy.png';
	import kokage_tree_necchusyou from '$lib/assets/irasutoya/kokage_tree_necchusyou.png';
	import type { NextReviewData } from '$lib/functions/assignments.remote';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';
	import Card from '$lib/components/Card.svelte';
	import Illustration from '$lib/components/Illustration.svelte';

	interface Props {
		numberOfAssignments: number;
		nextReviewData: NextReviewData | null;
		onReviewButtonPressed: () => void;
	}

	let { numberOfAssignments, nextReviewData, onReviewButtonPressed }: Props =
		$props();

	let reviewState = $derived.by(() => {
		if (numberOfAssignments === 0) {
			const instructions = (() => {
				if (!nextReviewData) return '';

				const formattedHour = new Intl.DateTimeFormat(undefined, {
					hour: 'numeric',
					minute: '2-digit'
				}).format(nextReviewData.nextReviewAt);

				return nextReviewData.numberOfReviews === 1
					? ` Come back at ${formattedHour} for a single review.`
					: ` Come back at ${formattedHour} for ${nextReviewData.numberOfReviews} more reviews.`;
			})();

			return {
				src: kokage_tree_necchusyou,
				alt: 'Boy resting under a tree',
				message: 'All caught up!',
				instructions
			};
		}

		if (numberOfAssignments < 10) {
			return {
				src: slump_good_man_study,
				alt: 'Man working effortlessly',
				message:
					numberOfAssignments === 1
						? "You've got just a single review."
						: `You've only got ${numberOfAssignments} reviews.`
			};
		}

		if (numberOfAssignments < 99) {
			return {
				src: study_night_boy,
				alt: 'Boy studying hard',
				message: `You've got ${numberOfAssignments} reviews.`
			};
		}

		return {
			src: study_chienetsu_boy,
			alt: 'Boy overwhelmed by work',
			message: `Damn! You've got ${numberOfAssignments} reviews.`
		};
	});
</script>

<Card class="px-12 py-10">
	<div class="flex flex-col items-center gap-4 text-center">
		<Illustration alt={reviewState.alt} src={reviewState.src} />

		<div>
			<h2 class="text-2xl font-medium">{reviewState.message}</h2>

			{#if reviewState.instructions}
				<p class="mt-1">{reviewState.instructions}</p>
			{/if}
		</div>

		{#if numberOfAssignments > 0}
			<Button
				keyboardShortcut={{
					handler: (e) => e.key === 'r',
					hintElement: reviewShortcut
				}}
				onclick={onReviewButtonPressed}
			>
				<BookOpen />
				<span>Start Reviewing</span>
			</Button>
		{/if}
	</div>
</Card>

{#snippet reviewShortcut()}
	<Kbd>R</Kbd>
{/snippet}
