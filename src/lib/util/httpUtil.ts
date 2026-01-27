import { getRequestEvent } from '$app/server';
import CookieUtil from '$lib/util/cookieUtil';

interface Parameters {
	method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
	/**
	 * Optional AbortSignal to cancel the request.
	 *
	 * Use this to abort in-flight requests when a component unmounts or dependencies change.
	 * Create a signal via `new AbortController().signal` and pass it here.
	 *
	 * @example
	 * const controller = new AbortController();
	 *
	 * const response = await sendHTTPRequest(url, {
	 *   method: 'GET',
	 *   signal: controller.signal
	 * });
	 *
	 * // Later, cancel the request:
	 * controller.abort();
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortController
	 */
	signal?: AbortSignal;
	searchParams?: URLSearchParams;
	body?: object;
}

/**
 * Sends an HTTP request and returns the parsed JSON response.
 *
 * @param path - The request path (relative to current origin)
 * @param options - Request configuration
 * @param options.method - HTTP method (GET, POST, DELETE, PUT, PATCH)
 * @param options.searchParams - Optional URL search parameters
 * @param options.signal - Optional AbortSignal to cancel the request. Use with AbortController.
 * @param options.body - Optional JSON body as string
 * @returns Promise resolving to the parsed JSON response
 * @throws {Error} If the response is not ok or not valid JSON
 *
 * @example
 * // Simple GET request
 * const data = await sendHTTPRequest('https://api.wanikani.com/v2/user', { method: 'GET' });
 *
 * @example
 * // POST request with abort capability
 * const controller = new AbortController();
 * const data = await sendHTTPRequest('https://api.wanikani.com/v2/reviews', {
 *   method: 'POST',
 *   signal: controller.signal,
 *   body: { review: {...} }
 * });
 */
export default async function sendHTTPRequest(
	path: string,
	{ method, searchParams, signal, body }: Parameters
) {
	const { cookies } = getRequestEvent();
	const apiToken = CookieUtil.get(cookies, 'api_token');

	if (!apiToken) {
		throw new Error('Could not get API token');
	}

	const url = new URL(path);

	if (searchParams) {
		for (const [key, value] of searchParams.entries()) {
			url.searchParams.set(key, value);
		}
	}

	const response = await fetch(url.toString(), {
		method: method,
		headers: { Authorization: `Bearer ${apiToken}` },
		signal: signal,
		body: JSON.stringify(body)
	});

	const json = await response.json();

	if (!response.ok) {
		const errorMessage = `Request failed: ${response.status} ${response.statusText} - ${json}`;
		throw new Error(errorMessage);
	}

	return json;
}
