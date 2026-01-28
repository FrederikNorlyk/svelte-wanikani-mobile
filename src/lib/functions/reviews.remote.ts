import { query } from '$app/server';
import sendHTTPRequest from '$lib/util/httpUtil';
import * as v from 'valibot';

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
	v.transform(({ assignmentId, incorrectMeaningAnswers, incorrectReadingAnswers }) => ({
		review: {
			assignment_id: assignmentId,
			incorrect_meaning_answers: incorrectMeaningAnswers,
			incorrect_reading_answers: incorrectReadingAnswers
		}
	}))
);

export const createReview = query(schema, async (body) => {
	try {
		await sendHTTPRequest('https://api.wanikani.com/v2/reviews/', {
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

	return { success: true };
});
