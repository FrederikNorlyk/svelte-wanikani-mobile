import {
	CONTACT_EMAIL,
	CRON_SECRET,
	DATABASE_URL,
	PRIVATE_VAPID
} from '$env/static/private';
import { PUBLIC_VAPID } from '$env/static/public';
import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';

webpush.setVapidDetails(`mailto:${CONTACT_EMAIL}`, PUBLIC_VAPID, PRIVATE_VAPID);

export async function GET({ request }) {
	const secret = request.headers.get('x-cron-secret');

	if (secret !== CRON_SECRET) {
		return new Response('Unauthorized', { status: 401 });
	}

	const sql = neon(DATABASE_URL);

	const rows = await sql`
		select *
		from user_notifications
		where next_review_at <= now()
	`;

	if (rows.length === 0) {
		return new Response(null, { status: 200 });
	}

	// Send all pushes concurrently
	const results = await Promise.allSettled(
		rows.map((row) =>
			webpush.sendNotification(
				row.push_subscription,
				JSON.stringify({
					title: 'Reviews Ready',
					body: 'You have reviews waiting.'
				})
			)
		)
	);

	const successfulEndpoints: string[] = [];

	results.forEach((result, index) => {
		if (result.status === 'fulfilled') {
			successfulEndpoints.push(rows[index].endpoint);
		} else {
			console.error('Push failed for', rows[index].endpoint, result.reason);
		}
	});

	if (successfulEndpoints.length > 0) {
		await sql`
      delete from user_notifications
      where endpoint = any(${successfulEndpoints})
    `;
	}

	return new Response(null, { status: 200 });
}
