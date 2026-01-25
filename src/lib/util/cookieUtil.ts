import type { Cookies } from '@sveltejs/kit';

export type CookieKey = 'api_token';

export default class CookieUtil {
	public static get(cookies: Cookies, key: CookieKey): string | undefined {
		return cookies.get(key);
	}

	public static set(cookies: Cookies, key: CookieKey, value: string) {
		cookies.set(key, value, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});
	}

	public static delete(cookies: Cookies, key: CookieKey) {
		cookies.delete(key, { path: '/' });
	}
}
