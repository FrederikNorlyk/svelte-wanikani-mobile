import { query } from '$app/server';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';
import { ValiError } from 'valibot';

const schema = v.pipe(
	v.object({
		assignmentId: v.pipe(
			v.number(),
			v.integer('assignmentId must be an integer'),
			v.minValue(1, 'assignmentId must be set')
		),
		incorrectMeaningAnswers: v.pipe(
			v.number(),
			v.integer('incorrectMeaningAnswers must be an integer'),
			v.minValue(0, 'incorrectMeaningAnswers must be zero or a positive number')
		),
		incorrectReadingAnswers: v.pipe(
			v.number(),
			v.integer('incorrectReadingAnswers must be an integer'),
			v.minValue(0, 'incorrectReadingAnswers must be zero or a positive number')
		)
	}),
	v.transform(
		({ assignmentId, incorrectMeaningAnswers, incorrectReadingAnswers }) => ({
			review: {
				assignment_id: assignmentId,
				incorrect_meaning_answers: incorrectMeaningAnswers,
				incorrect_reading_answers: incorrectReadingAnswers
			}
		})
	)
);

const responseSchema = v.pipe(
	v.object({
		data: v.object({
			starting_srs_stage: v.number(),
			ending_srs_stage: v.number()
		})
	}),
	v.transform((response) => ({
		startingStage: response.data.starting_srs_stage,
		endingStage: response.data.ending_srs_stage
	}))
);

export type ReviewResult = v.InferOutput<typeof responseSchema>;

export const createReview = query(schema, async (body) => {
	let json;
	try {
		json = await sendHTTPRequest('https://api.wanikani.com/v2/reviews/', {
			method: 'POST',
			body: body
		});
	} catch (e) {
		console.error(e);

		if (e instanceof Error) {
			return { success: false, error: e.message };
		}
		throw e;
	}

	let parsed;
	try {
		parsed = v.parse(responseSchema, json);
	} catch (e) {
		if (e instanceof ValiError && e.issues) {
			const issue = e.issues[0];
			return { success: false, error: issue.message };
		}
		throw e;
	}

	return { success: true, result: parsed };
});
