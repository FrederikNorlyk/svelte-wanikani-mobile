import type {
	Assignment,
	NextReviewData
} from '$lib/functions/assignments.remote';
import * as AssignmentAPI from '$lib/functions/assignments.remote';
import {
	registerPushNotification,
	unregisterPushNotification
} from '$lib/functions/notifications.remote';
import AppMetadataRepository from '$lib/repository/local-storage/appMetadataRepository';
import type { ReviewsPresentationOrder } from '$lib/types/reviewsPresentationOrder';
import * as NotificationUtil from '$lib/util/notificationUtil';

export async function refresh(
	reviewsPresentationOrder: ReviewsPresentationOrder
): Promise<[Assignment[], NextReviewData | null]> {
	const assignments = await AssignmentAPI.getAvailableAssignments();

	let nextReviewData: NextReviewData | null = null;

	if (assignments.length === 0) {
		nextReviewData = await AssignmentAPI.getNextReviewData();

		if (nextReviewData) {
			void updateNextPushNotificationDate(nextReviewData.nextReviewAt);
		}
	} else {
		sortAssignments(assignments, reviewsPresentationOrder);
	}

	AppMetadataRepository.set({ lastAssignmentsFetchTimestamp: new Date() });

	return [assignments, nextReviewData];
}

function sortAssignments(
	assignments: Assignment[],
	reviewsPresentationOrder: ReviewsPresentationOrder
) {
	switch (reviewsPresentationOrder) {
		case 'apprentice_first':
			assignments.sort((a, b) => {
				const aIsApprentice = a.srsStage === 'Apprentice';
				const bIsApprentice = b.srsStage === 'Apprentice';

				if (aIsApprentice !== bIsApprentice) {
					return aIsApprentice ? -1 : 1;
				}

				return Math.random() - 0.5;
			});
			break;
		case 'lower_srs_category_first':
			assignments.sort((a, b) => {
				const stageOrder = new Map([
					['Apprentice', 0],
					['Guru', 1],
					['Master', 2],
					['Enlightened', 3],
					['Burned', 4]
				] as const);

				const aOrder = stageOrder.get(a.srsStage) ?? 99;
				const bOrder = stageOrder.get(b.srsStage) ?? 99;

				return aOrder - bOrder;
			});
			break;
		case 'shuffled':
		case 'lower_levels_first': // Unsupported
		default:
			for (let i = assignments.length - 1; i > 0; i--) {
				const randomIndex = Math.floor(Math.random() * (i + 1));
				const temp = assignments[i];

				assignments[i] = assignments[randomIndex];
				assignments[randomIndex] = temp;
			}
			break;
	}
}

async function updateNextPushNotificationDate(
	nextReviewAt: Date
): Promise<void> {
	const subscription = await NotificationUtil.getSubscription();

	if (!subscription) {
		return;
	}

	if (nextReviewAt) {
		await registerPushNotification({
			endpoint: subscription.endpoint,
			subscription: JSON.stringify(subscription),
			nextReviewAt: nextReviewAt
		});
	} else {
		await unregisterPushNotification(subscription.endpoint);
	}
}
