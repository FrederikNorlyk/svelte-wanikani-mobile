import { command, form, getRequestEvent } from '$app/server';
import * as UserAPI from '$lib/functions/user.remote';
import CookieUtil from '$lib/util/cookieUtil';
import { invalid, redirect } from '@sveltejs/kit';
import * as v from 'valibot';

export const login = form(
	v.object({
		_apiToken: v.pipe(v.string(), v.trim(), v.nonEmpty('API key is missing'))
	}),
	async ({ _apiToken }, issue) => {
		const { cookies } = getRequestEvent();
		CookieUtil.set(cookies, 'api_token', _apiToken);

		try {
			await UserAPI.getUser();
		} catch (e) {
			console.error(e);
			CookieUtil.delete(cookies, 'api_token');
			invalid(issue._apiToken('Invalid API token'));
		}

		redirect(303, '/');
	}
);

export const logOut = command(v.object({}), async () => {
	const { cookies } = getRequestEvent();
	CookieUtil.delete(cookies, 'api_token');
});
