import { query } from '$app/server';
import sendHTTPRequest from '$lib/util/httpUtil';
import { getSrsStage } from '$lib/util/srsStageUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const assignmentSchema = v.pipe(
	v.object({
		id: v.number(),
		data: v.object({
			subject_id: v.number(),
			srs_stage: v.number()
		})
	}),
	v.transform((data) => ({
		id: data.id,
		subjectId: data.data.subject_id,
		srsStage: getSrsStage(data.data.srs_stage)
	}))
);

const schema = v.object({
	pages: v.object({
		next_url: v.nullable(v.string())
	}),
	data: v.array(assignmentSchema)
});

export type Assignment = v.InferOutput<typeof assignmentSchema>;

export const getAvailableAssignments = query(async () => {
	let nextUrl: string | null = 'https://api.wanikani.com/v2/assignments';
	let assignments: Assignment[] = [];

	while (nextUrl) {
		const json = await sendHTTPRequest(nextUrl, {
			method: 'GET',
			searchParams: new URLSearchParams({
				immediately_available_for_review: 'true'
			})
		});

		let parsed;
		try {
			parsed = v.parse(schema, json);
		} catch (e) {
			if (e instanceof ValiError && e.issues) {
				const issue = e.issues[0];
				throw new Error(issue.message);
			}
			throw e;
		}

		assignments = [...assignments, ...parsed.data];
		nextUrl = parsed.pages.next_url;
	}

	return assignments;
});

const nextReviewAtSchema = v.object({
	pages: v.object({
		next_url: v.nullable(v.string())
	}),
	data: v.array(
		v.object({
			data: v.object({
				available_at: v.pipe(
					v.string(),
					v.transform((dateString) => {
						return new Date(dateString);
					})
				)
			})
		})
	)
});

export const getNextReviewAvailableAt = query(async () => {
	let nextUrl: string | null = 'https://api.wanikani.com/v2/assignments';
	let mostNearbyDate = null;

	const now = Date.now();
	const oneHourFromNow = new Date(now + 60 * 60 * 1000);
	const availableBefore = new Date(now + 24 * 60 * 60 * 1000).toISOString(); // +24 hours
	const availableAfter = new Date(now + 60 * 1000).toISOString(); // +1 minute

	while (nextUrl) {
		const json = await sendHTTPRequest(nextUrl, {
			method: 'GET',
			searchParams: new URLSearchParams({
				in_review: 'true',
				available_before: availableBefore,
				available_after: availableAfter
			})
		});

		let parsed;
		try {
			parsed = v.parse(nextReviewAtSchema, json);
		} catch (e) {
			if (e instanceof ValiError && e.issues) {
				const issue = e.issues[0];
				throw new Error(issue.message);
			}
			throw e;
		}

		for (const assignment of parsed.data) {
			const availableAt = assignment.data.available_at;

			// Exit early if anything is coming up within the next hour
			if (availableAt <= oneHourFromNow) {
				return availableAt;
			}

			if (!mostNearbyDate || availableAt < mostNearbyDate) {
				mostNearbyDate = availableAt;
			}
		}

		nextUrl = parsed.pages.next_url;
	}

	return mostNearbyDate;
});
