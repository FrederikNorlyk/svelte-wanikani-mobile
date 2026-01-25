import { form, getRequestEvent } from "$app/server";
import { getUser } from "$lib/functions/user.remote";
import CookieUtil from "$lib/util/cookieUtil";
import { invalid, redirect } from "@sveltejs/kit";
import * as v from "valibot";

export const login = form(
  v.object({
    _apiToken: v.pipe(v.string(), v.trim(), v.nonEmpty("API key is missing")),
  }),
  async ({ _apiToken }, issue) => {
    const { cookies } = getRequestEvent();
    CookieUtil.set(cookies, "api_token", _apiToken);

    try {
      await getUser();
    } catch {
      CookieUtil.delete(cookies, "api_token");
      invalid(issue._apiToken("Invalid API token"));
    }

    redirect(303, "/");
  },
);

export const logout = form(v.object({}), async () => {
  const { cookies } = getRequestEvent();
  CookieUtil.delete(cookies, "api_token");

  redirect(303, "/login");
});
