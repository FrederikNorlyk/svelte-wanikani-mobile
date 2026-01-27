import { query } from '$app/server';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const assignmentSchema = v.pipe(
	v.object({
		id: v.pipe(v.number(), v.integer(), v.minValue(1, 'id must be a positive number')),
		data: v.object({
			subject_id: v.pipe(
				v.number(),
				v.integer(),
				v.minValue(1, 'subject_id must be a positive number')
			)
		})
	}),
	v.transform((data) => ({
		id: data.id,
		subjectId: data.data.subject_id
	}))
);

const schema = v.object({
	pages: v.object({
		next_url: v.nullable(v.string())
	}),
	data: v.array(assignmentSchema)
});

export type Assignment = v.InferOutput<typeof assignmentSchema>;

export const getAllAssignments = query(async () => {
	let nextUrl: string | null = 'https://api.wanikani.com/v2/assignments';
	let assignments: Assignment[] = [];

	while (nextUrl) {
		const json = await sendHTTPRequest(nextUrl, {
			method: 'GET',
			searchParams: new URLSearchParams({ immediately_available_for_review: 'true' })
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
