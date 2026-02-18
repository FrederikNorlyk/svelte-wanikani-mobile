import { PUBLIC_VAPID } from '$env/static/public';
import * as NotificationsAPI from '$lib/functions/notifications.remote';
import { base64UrlToUint8Array } from '$lib/util/base64';

export async function getSubscription(): Promise<PushSubscription | undefined> {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		return undefined;
	}

	if (Notification.permission !== 'granted') {
		return undefined;
	}

	const registration = await navigator.serviceWorker.ready;

	const subscription = await registration.pushManager.getSubscription();

	if (subscription) {
		return subscription;
	}

	return await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: base64UrlToUint8Array(PUBLIC_VAPID)
	});
}

export async function unregisterPushNotifications() {
	const subscription = await getSubscription();

	if (!subscription) {
		return;
	}

	await NotificationsAPI.unregisterPushNotification(subscription.endpoint);
}
