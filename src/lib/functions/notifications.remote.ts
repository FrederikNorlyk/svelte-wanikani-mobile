import { command } from '$app/server';
import { DATABASE_URL } from '$env/static/private';
import { neon } from '@neondatabase/serverless';
import * as v from 'valibot';

export const registerPushNotification = command(
	v.object({
		endpoint: v.string(),
		subscription: v.string(),
		nextReviewAt: v.date()
	}),
	async ({ endpoint, subscription, nextReviewAt }) => {
		const sql = neon(DATABASE_URL);

		await sql`
			insert into user_notifications
				(endpoint, push_subscription, next_review_at)
			values (${endpoint}, ${subscription}, ${nextReviewAt}) on conflict (endpoint)
    do
			update set
				push_subscription = excluded.push_subscription,
				next_review_at = excluded.next_review_at
		`;
	}
);

export const unregisterPushNotification = command(
	v.string(),
	async (endpoint) => {
		const sql = neon(DATABASE_URL);

		await sql`
		delete from user_notifications
		where endpoint = ${endpoint}
	`;
	}
);
