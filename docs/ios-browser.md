# iOS browser synchronization and installation

The reported symptom was a screen stuck on “Synchronizing with WaniKani” in an
iOS browser, with no visible error.

## Reproduction and cause

The browser regression test runs the real remote functions, subject conversion,
IndexedDB writes, and home-screen transition against a small fixture API. Removing
`window.Notification` reproduces the stuck synchronization screen even though the
subject has been committed to IndexedDB.

`HomePage` mounts `SettingsDrawer` immediately, including when the drawer is closed.
Its unguarded `Notification.permission` access threw `ReferenceError: Notification
is not defined`. This interrupted rendering the home screen, leaving the previous
synchronization screen visible. Keeping the API available made the same test pass.

A second unguarded call, `ServiceWorkerRegistration.getNotifications()`, produced
an unhandled rejection when absent, but did not itself prevent rendering the home
screen in the isolated test. Both accesses are now guarded. Unsupported browsers
also skip push subscriptions and show an explanation in settings.

This reproduces the reported symptom under simulated iOS API availability; it is
not a trace captured from the affected device. The test does not rule out separate
network or storage problems on a particular device.

[WebKit documents web push support for Home Screen apps on iOS/iPadOS 16.4+](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
Installing is not a prerequisite for IndexedDB: [WebKit's storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
covers browser storage and gives standalone apps the same storage quotas as
browser apps starting with Safari 17.

## Installation guidance

The global prompt appears in iPhone/iPad browsers, including iPads using a desktop
user agent. It is hidden when either `navigator.standalone` or the `standalone`
display-mode media query indicates that this window is an installed app. It cannot
determine whether a separate installation exists elsewhere on the device.

Instructions follow [Apple's Safari installation steps](https://support.apple.com/guide/iphone/iphea86e5236/ios):
Share → Add to Home Screen → enable Open as Web App if offered → Add, then launch
the Home Screen icon. Users can dismiss the prompt and continue in the browser.
Dismissal lasts for the current page session and does not require working storage.

## Browser tests

```sh
pnpm exec playwright install chromium webkit
pnpm test:browser
```

The test server supplies placeholder environment values, blocks unexpected
upstream requests, and uses fixture WaniKani responses. No real API token or
notification database is needed. Tests cover committed subject data, successful
home-screen rendering with notification APIs absent, settings fallback, and
installation detection/dismissal across browser and installed contexts.

On a host with an existing Chromium installation:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/sbin/chromium pnpm test:browser --project chromium
```

Physical iOS verification remains useful: log in from Safari, confirm that sync
finishes, follow the instructions, and launch the installed app to confirm that
the prompt is absent. WebKit tests also require the platform libraries listed by
`playwright install-deps`.
