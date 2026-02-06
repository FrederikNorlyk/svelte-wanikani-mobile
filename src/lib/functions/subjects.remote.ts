import { query } from '$app/server';
import { subjectTypes } from '$lib/types/subjectType';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const subjectSchema = v.pipe(
	v.object({
		id: v.number(),
		object: v.picklist(subjectTypes),
		data: v.object({
			level: v.number(),
			document_url: v.string(),
			characters: v.nullable(v.string()),
			meanings: v.array(
				v.object({
					meaning: v.string(),
					primary: v.boolean()
				})
			),
			readings: v.optional(
				v.array(
					v.object({
						primary: v.boolean(),
						reading: v.string()
					})
				)
			),
			pronunciation_audios: v.optional(
				v.array(
					v.object({
						url: v.string(),
						metadata: v.object({
							gender: v.picklist(['male', 'female']),
							pronunciation: v.string()
						})
					})
				)
			)
		})
	}),
	v.transform((data) => ({
		id: data.id,
		type: data.object,
		level: data.data.level,
		documentUrl: data.data.document_url,
		characters: data.data.characters,
		meanings: data.data.meanings,
		readings: data.data.readings,
		audio:
			data.data.pronunciation_audios?.map((audio) => ({
				url: audio.url,
				gender: audio.metadata.gender,
				reading: audio.metadata.pronunciation
			})) ?? [],
		get primaryMeaning() {
			return this.meanings.find((meaning) => meaning.primary)?.meaning;
		},
		get primaryReading() {
			return this.readings?.find((reading) => reading.primary)?.reading;
		},
		get secondaryMeanings() {
			return this.meanings
				.filter(
					(meaning) =>
						!meaning.primary &&
						meaning.meaning.toLowerCase() !== this.primaryMeaning?.toLowerCase()
				)
				.map((meaning) => meaning.meaning);
		},
		get secondaryReadings() {
			return (
				this.readings
					?.filter(
						(reading) =>
							!reading.primary &&
							reading.reading.toLowerCase() !==
								this.primaryReading?.toLowerCase()
					)
					.map((reading) => reading.reading) ?? []
			);
		}
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
