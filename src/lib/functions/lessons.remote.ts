import { query } from '$app/server';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const assignmentCountSchema = v.object({
	total_count: v.number()
});

export const getAvailableLessonsCount = query(async () => {
	const json = await sendHTTPRequest(
		'https://api.wanikani.com/v2/assignments',
		{
			method: 'GET',
			searchParams: new URLSearchParams({
				immediately_available_for_lessons: 'true'
			})
		}
	);

	try {
		return v.parse(assignmentCountSchema, json).total_count;
	} catch (e) {
		if (e instanceof ValiError && e.issues) {
			const issue = e.issues[0];
			throw new Error(issue.message, { cause: e });
		}
		throw e;
	}
});
