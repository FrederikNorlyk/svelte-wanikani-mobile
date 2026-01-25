import { getRequestEvent, query } from "$app/server";
import CookieUtil from "$lib/util/cookieUtil";
import * as v from "valibot";

const userSchema = v.pipe(
  v.object({
    username: v.string(),
    level: v.number(),
    current_vacation_started_at: v.pipe(
      v.union([v.null_(), v.string()]),
      v.transform((value) => (value === null ? undefined : new Date(value))),
      v.check(
        (value) => value === undefined || !Number.isNaN(value.getTime()),
        "current_vacation_started_at must be null or a valid date string",
      ),
    ),
  }),
  v.transform((data) => ({
    name: data.username,
    level: data.level,
    currentVacationStartedAt: data.current_vacation_started_at,
  })),
);

const schema = v.object({
  data: userSchema,
});

export type User = v.InferOutput<typeof userSchema>;

export const getUser = query(async () => {
  const { cookies } = getRequestEvent();
  const apiToken = CookieUtil.get(cookies, "api_token");

  if (!apiToken) {
    throw new Error("Could not get user, no api key.");
  }

  const response = await fetch("https://api.wanikani.com/v2/user", {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user (${response.status})`);
  }

  const json = await response.json();
  const parsed = v.parse(schema, json);
  return parsed.data;
});
