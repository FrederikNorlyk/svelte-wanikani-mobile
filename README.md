# WaniKani Mobile

This is a community-made mobile app for WaniKani. WaniKani is a Japanese language learning web app that uses mnemonics and SRS to make kanji learning simple.

This app is built using SvelteKit and optimized for performance, using optimistic rendering, async operations, and local data storage to give users a smooth experience.

<img src="screenshot-01.png" alt="Screenshot of the main page">

## Try it out 🚀

I'm hosting the app [here on Vercel](https://svelte-wanikani-mobile.vercel.app).

## Local development

This project contains a [devcontainer configuration](.devcontainer/devcontainer.json), making it easy to start developing. All that's needed is to include the necessary environment variables.

### Environment variables

I use the Vercel CLI to link the application with my project in Vercel ([Read more](https://vercel.com/docs/cli)).

```bash
pnpm dlx vercel link
```

After linking the project, create an `.env.local` file by running:

```bash
pnpm dlx vercel env pull
```

These required variables should now be present.

```
CRON_SECRET=
PRIVATE_VAPID=
PUBLIC_VAPID=
CONTACT_EMAIL=
DATABASE_URL=
```

## Push notifications

An hourly cron job can be configured to trigger `/api/push-notifications` with
the header `x-cron-secret` (matching the environment variable `CRON_SECRET`).
This will notify any clients with pending reviews.

You can schedule the cron job by adding the following, using `crontab -e`.

```
0 * * * * curl --silent --show-error --fail --max-time 20 -H "x-cron-secret: SECRET" "https://HOST/api/push-notifications" > /dev/null 2>&1
```

## Application asset caching

The service worker downloads bundled images in the background on first launch,
without blocking app use. SvelteKit's generated build and static-file manifests
identify the assets automatically.

Images live in `wanikani-mobile-images`, with no expiration or app-controlled
cleanup. Every launch requests missing images only, retrying interrupted downloads
and adding new image URLs after updates. Successful downloads survive partial
failures. Obsolete images stay cached. Image URLs must be immutable: use a new
filename when replacing a static image; imported images receive build hashes.
The browser or user can still clear storage, in which case missing images download
again. There is no mascot-specific preloading or decoding; initial downloads and
image decoding can still cause a visible delay.

Other build assets and static files, including JavaScript and CSS, are precached
in `wanikani-mobile-assets-<version>`. A new worker waits for tabs using the old
worker to close before activating and deleting old deployment caches. The image
cache and unrelated caches are preserved.

Only exact manifest asset URLs and GET requests use cache-first responses. Cache
misses fall back to the network and successful responses refill the cache. API,
authentication, remote-function and page requests retain their normal behavior.
Cached images work offline; this does not provide offline page navigation.

### Verify with a production build

Run `pnpm build`, then `pnpm preview`. The generated build manifest is empty in
development, so use the production preview for verification:

1. Open the app and confirm it remains usable during installation. Check Cache
   Storage for images in `wanikani-mobile-images` and other assets in the versioned
   cache. Confirm the review buttons are created only after “Show answer.”
2. Reload to use the worker. Disable the HTTP cache in DevTools and confirm image
   requests come from the service worker, with no repeat image downloads.
3. Delete one image cache entry, then reload. Confirm that image is downloaded
   again while other cached images are retained. Interrupt image downloads and
   relaunch online to verify successful entries survive and missing ones retry.
4. Switch offline with the page open: cached images should render and dynamic
   requests should fail normally. Restore the network afterward.
5. Build and preview a new deployment on the same port. Update the worker, close
   old tabs, and reopen the app. Old deployment caches should disappear; images,
   including obsolete entries, and unrelated caches should remain.
6. With notifications allowed, use DevTools' Push action with
   `{"title":"Asset cache check","body":"Push still works"}`. Confirm the title,
   body and application icon. Push-service delivery requires a subscribed deployment.
