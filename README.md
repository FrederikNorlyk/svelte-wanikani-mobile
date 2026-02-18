# WaniKani Mobile

## Environment variables

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

You can schedule the cron job by add the following, using `crontab -e`.

```
0 * * * * curl --silent --show-error --fail --max-time 20 -H "x-cron-secret: SECRET" "https://HOST/api/push-notifications" > /dev/null 2>&1
```
