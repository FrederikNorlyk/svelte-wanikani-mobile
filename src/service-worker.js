/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

const self = /** @type {ServiceWorkerGlobalScope} */ (
	/** @type {unknown} */ (globalThis.self)
);

const imageCacheName = 'wanikani-mobile-images';
const cachePrefix = 'wanikani-mobile-assets-';
const cacheName = `${cachePrefix}${version}`;
const assets = new Set(
	[...build, ...files].map((path) => new URL(path, self.location.origin).href)
);

const images = new Set(
	[...assets].filter((url) =>
		/\.(avif|gif|ico|jpe?g|png|svg|webp)$/i.test(new URL(url).pathname)
	)
);

/** @type {Promise<void> | undefined} */
let imageDownload;

function cacheMissingImages() {
	return (imageDownload ??= (async () => {
		const cache = await caches.open(imageCacheName);
		// Keep successful downloads even if another image fails; retry missing ones next launch.
		await Promise.allSettled(
			[...images].map(async (url) => {
				if (!(await cache.match(url))) await cache.add(url);
			})
		);
	})().finally(() => {
		imageDownload = undefined;
	}));
}

self.addEventListener('message', (event) => {
	if (event.data?.type === 'cache-images') {
		event.waitUntil(cacheMissingImages());
	}
});

self.addEventListener('install', (event) => {
	async function precacheAssets() {
		const cache = await caches.open(cacheName);
		await Promise.all([
			cache.addAll([...assets].filter((url) => !images.has(url))),
			cacheMissingImages()
		]);
	}

	event.waitUntil(precacheAssets());
});

self.addEventListener('activate', (event) => {
	async function deleteOldAssetCaches() {
		for (const key of await caches.keys()) {
			if (key.startsWith(cachePrefix) && key !== cacheName) {
				await caches.delete(key);
			}
		}
	}

	// Let existing tabs finish using their deployment before replacing its cache.
	event.waitUntil(deleteOldAssetCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET' || !assets.has(event.request.url)) {
		return;
	}

	async function respondWithAsset() {
		const cache = await caches.open(
			images.has(event.request.url) ? imageCacheName : cacheName
		);
		const cached = await cache.match(event.request);
		if (cached) return cached;

		const response = await fetch(event.request);
		if (response.ok) {
			try {
				await cache.put(event.request, response.clone());
			} catch {
				// Storage failures must not prevent displaying a downloaded asset.
			}
		}
		return response;
	}

	event.respondWith(respondWithAsset());
});

self.addEventListener('push', (event) => {
	if (!event.data) {
		return;
	}

	const data = event.data.json();

	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: '/logo_192.png'
		})
	);
});
