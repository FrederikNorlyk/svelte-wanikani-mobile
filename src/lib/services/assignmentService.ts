import type { Assignment } from '$lib/functions/assignments.remote';
import * as AssignmentAPI from '$lib/functions/assignments.remote';
import {
	registerPushNotification,
	unregisterPushNotification
} from '$lib/functions/notifications.remote';
import * as NotificationUtil from '$lib/util/notificationUtil';

export async function getAssignments(): Promise<Assignment[]> {
	const assignments = await AssignmentAPI.getAvailableAssignments();

	if (assignments.length === 0) {
		void updateNextPushNotificationDate();
	}

	return assignments;
}

async function updateNextPushNotificationDate(): Promise<void> {
	const subscription = await NotificationUtil.getSubscription();

	if (!subscription) {
		return;
	}

	const nextReviewAt = await AssignmentAPI.getNextReviewAvailableAt();

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
