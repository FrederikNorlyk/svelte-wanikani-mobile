<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import slump_good_man_study from '$lib/assets/irasutoya/slump_good_man_study.png';
	import study_night_boy from '$lib/assets/irasutoya/study_night_boy.png';
	import study_chienetsu_boy from '$lib/assets/irasutoya/study_chienetsu_boy.png';
	import kokage_tree_necchusyou from '$lib/assets/irasutoya/kokage_tree_necchusyou.png';
	import type { NextReviewData } from '$lib/functions/assignments.remote';
	import Button from '$lib/components/Button.svelte';
	import { Kbd } from '$lib/shadcn/components/ui/kbd';

	interface Props {
		numberOfAssignments: number;
		nextReviewData: NextReviewData | null;
		onReviewButtonPressed: () => void;
	}

	let { numberOfAssignments, nextReviewData, onReviewButtonPressed }: Props =
		$props();

	let reviewState = $derived.by(() => {
		if (numberOfAssignments === 0) {
			const nextReviewMessage = (() => {
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
				instructions: nextReviewMessage
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

<section class="paper-effect">
	<div class="review-card__content">
		<img
			class="review-card__illustration"
			alt={reviewState.alt}
			src={reviewState.src}
		/>

		<div>
			<p class="text-2xl font-medium">{reviewState.message}</p>

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
				<BookOpen size={30} strokeWidth={2.2} />
				<span>Start Reviewing</span>
			</Button>
		{/if}
	</div>
</section>

{#snippet reviewShortcut()}
	<Kbd>R</Kbd>
{/snippet}

<style>
	section {
		position: relative;
		overflow: hidden;

		padding: 2rem 3rem;

		border: 2px solid var(--card-border);
		border-radius: 30px;

		background:
			linear-gradient(220deg, rgb(255 255 255 / 4%), transparent 40%),
			var(--card);

		color: var(--card-foreground);

		box-shadow:
			0 5px 0 var(--card-shadow-depth),
			0 10px 22px var(--card-shadow-glow),
			inset 0 1px 0 var(--card-shadow-highlight);
	}

	.review-card__content {
		position: relative;
		z-index: 2;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;

		text-align: center;
	}

	img {
		width: 200px;
		height: 200px;
		object-fit: contain;
	}
</style>
