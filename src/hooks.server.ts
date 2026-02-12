import CookieUtil from '$lib/util/cookieUtil';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const routeId = event.route.id;

	const apiToken = CookieUtil.get(event.cookies, 'api_token');

	if (routeId?.startsWith('/(authed)') && !apiToken) {
		throw redirect(303, '/login');
	}

	if (routeId?.startsWith('/login') && apiToken) {
		throw redirect(303, '/');
	}

	return resolve(event);
};
