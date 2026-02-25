import type {
	Assignment,
	NextReviewData
} from '$lib/functions/assignments.remote';
import * as AssignmentAPI from '$lib/functions/assignments.remote';
import {
	registerPushNotification,
	unregisterPushNotification
} from '$lib/functions/notifications.remote';
import * as NotificationUtil from '$lib/util/notificationUtil';

export async function refresh(): Promise<
	[Assignment[], NextReviewData | null]
> {
	const assignments = await AssignmentAPI.getAvailableAssignments();

	let nextReviewData: NextReviewData | null = null;

	if (assignments.length === 0) {
		nextReviewData = await AssignmentAPI.getNextReviewData();

		if (nextReviewData) {
			void updateNextPushNotificationDate(nextReviewData.nextReviewAt);
		}
	}

	return [assignments, nextReviewData];
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
