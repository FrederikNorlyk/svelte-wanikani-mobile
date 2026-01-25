import { getRequestEvent, query } from "$app/server";
import CookieUtil from "$lib/util/cookieUtil";
import * as v from "valibot";

const subjectSchema = v.pipe(
  v.object({
    id: v.number(),
    object: v.picklist(["radical", "kanji", "vocabulary"]),
    data: v.object({
      characters: v.string(),
      meanings: v.array(
        v.object({
          meaning: v.string(),
          primary: v.boolean(),
          accepted_answer: v.boolean(),
        }),
      ),
      readings: v.array(
        v.object({
          type: v.picklist(["onyomi", "kunyomi", "nanori"]),
          primary: v.boolean(),
          accepted_answer: v.boolean(),
          reading: v.string(),
        }),
      ),
    }),
  }),
  v.transform((data) => ({
    id: data.id,
  })),
);
const schema = v.object({
  pages: v.object({
    next_url: v.optional(v.string()),
  }),
  data: v.array(subjectSchema),
});

export const getAllSubjects = query(async () => {
  let nextUrl = "https://api.wanikani.com/v2/subjects";
  let subjects = [];

  while (nextUrl) {
    const response = await fetchSubjects(nextUrl);
    nextUrl = response.pages.next_url;
  }
});

async function fetchSubjects(url: string): typeof schema {
  const { cookies } = getRequestEvent();
  const apiToken = CookieUtil.get(cookies, "api_token");

  if (!apiToken) {
    throw new Error("Could not get user, no api key.");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subject (${response.status})`);
  }

  const json = await response.json();
  return v.parse(schema, json);
}
