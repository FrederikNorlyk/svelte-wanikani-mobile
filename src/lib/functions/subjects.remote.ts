import { query } from '$app/server';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const subjectSchema = v.pipe(
	v.object({
		id: v.number(),
		object: v.string(),
		data: v.object({
			characters: v.nullable(v.string()),
			meanings: v.array(
				v.object({
					meaning: v.string(),
					primary: v.boolean(),
					accepted_answer: v.boolean()
				})
			),
			readings: v.optional(
				v.array(
					v.object({
						type: v.optional(v.string()),
						primary: v.boolean(),
						accepted_answer: v.boolean(),
						reading: v.string()
					})
				)
			)
		})
	}),
	v.transform((data) => ({
		id: data.id,
		object: data.object,
		characters: data.data.characters,
		meanings: data.data.meanings,
		readings: data.data.readings
	}))
);

const schema = v.object({
	pages: v.object({
		next_url: v.nullable(v.string())
	}),
	data: v.array(subjectSchema)
});

export type Subject = v.InferOutput<typeof subjectSchema>;

export const getAllSubjects = query(async () => {
	let nextUrl: string | null = 'https://api.wanikani.com/v2/subjects';
	let subjects: Subject[] = [];

	while (nextUrl) {
		const json = await sendHTTPRequest(nextUrl, { method: 'GET' });
		let response;
		try {
			response = v.parse(schema, json);
		} catch (e) {
			if (e instanceof ValiError && e.issues) {
				const issue = e.issues[0];
				throw new Error(issue.message);
			}
			throw e;
		}

		subjects = [...subjects, ...response.data];
		nextUrl = response.pages.next_url;
	}

	return subjects;
});
