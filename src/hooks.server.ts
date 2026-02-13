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

	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	response.headers.set(
		'Permissions-Policy',
		[
			'accelerometer=()',
			'autoplay=()',
			'camera=()',
			'clipboard-read=(self)',
			'clipboard-write=()',
			'display-capture=()',
			'encrypted-media=()',
			'fullscreen=()',
			'geolocation=()',
			'gyroscope=()',
			'magnetometer=()',
			'microphone=()',
			'midi=()',
			'payment=()',
			'picture-in-picture=()',
			'publickey-credentials-get=()',
			'screen-wake-lock=()',
			'usb=()',
			'web-share=()',
			'xr-spatial-tracking=()'
		].join(', ')
	);

	return response;
};
