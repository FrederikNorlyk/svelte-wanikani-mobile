import { getRequestEvent, query } from '$app/server';
import CookieUtil from '$lib/util/cookieUtil';
import * as v from 'valibot';

const subjectSchema = v.pipe(
	v.object({
		id: v.number(),
		object: v.picklist(['radical', 'kanji', 'vocabulary']),
		data: v.object({
			characters: v.string(),
			meanings: v.array(
				v.object({
					meaning: v.string(),
					primary: v.boolean(),
					accepted_answer: v.boolean()
				})
			),
			readings: v.array(
				v.object({
					type: v.picklist(['onyomi', 'kunyomi', 'nanori']),
					primary: v.boolean(),
					accepted_answer: v.boolean(),
					reading: v.string()
				})
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
		next_url: v.optional(v.string())
	}),
	data: v.array(subjectSchema)
});

export type Subject = v.InferOutput<typeof subjectSchema>;

export const getAllSubjects = query(async () => {
	let nextUrl: string | undefined = 'https://api.wanikani.com/v2/subjects';
	let subjects: Subject[] = [];

	while (nextUrl) {
		const response = await fetchSubjects(nextUrl);
		subjects = [...subjects, ...response.data];
		nextUrl = response.pages.next_url;
	}

	return subjects;
});

async function fetchSubjects(url: string) {
	const { cookies } = getRequestEvent();
	const apiToken = CookieUtil.get(cookies, 'api_token');

	if (!apiToken) {
		throw new Error('Could not get user, no api key.');
	}

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${apiToken}`
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch subjects (${response.status})`);
	}

	const json = await response.json();
	return v.parse(schema, json);
}
