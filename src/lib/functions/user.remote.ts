import { query } from '$app/server';
import { reviewsPresentationOrder } from '$lib/types/reviewsPresentationOrder';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const userSchema = v.pipe(
	v.object({
		level: v.number(),
		current_vacation_started_at: v.pipe(
			v.union([v.null_(), v.string()]),
			v.transform((value) => (value === null ? undefined : new Date(value))),
			v.check(
				(value) => value === undefined || !Number.isNaN(value.getTime()),
				'current_vacation_started_at must be null or a valid date string'
			)
		),
		subscription: v.object({
			max_level_granted: v.number()
		}),
		preferences: v.object({
			reviews_presentation_order: v.picklist(reviewsPresentationOrder)
		})
	}),
	v.transform((data) => ({
		level: data.level,
		currentVacationStartedAt: data.current_vacation_started_at,
		maxLevelGranted: data.subscription.max_level_granted,
		reviewsPresentationOrder: data.preferences.reviews_presentation_order
	}))
);

const schema = v.object({
	data: userSchema
});

export type User = v.InferOutput<typeof userSchema>;

export const getUser = query(async () => {
	const json = await sendHTTPRequest('https://api.wanikani.com/v2/user', {
		method: 'GET'
	});

	let parsed;
	try {
		parsed = v.parse(schema, json);
	} catch (e) {
		if (e instanceof ValiError && e.issues) {
			const issue = e.issues[0];
			throw new Error(issue.message, { cause: e });
		}
		throw e;
	}

	return parsed.data;
});
