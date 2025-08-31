import { defineEventHandler, getHeader, getCookie, deleteCookie } from "h3";
import { useRuntimeConfig } from "#imports";
import { $fetch } from "ofetch";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  EXP_TIME_KEY,
} from "../../../constants/auth";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.enfyraSDK.apiUrl;

  const refreshToken = getCookie(event, REFRESH_TOKEN_KEY);

  try {
    const result = await $fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: {
        cookie: getHeader(event, "cookie") || "",
        authorization: event.context.proxyHeaders?.authorization,
      },
      body: {
        refreshToken,
      },
    });

    // Delete cookies on Nuxt side
    deleteCookie(event, ACCESS_TOKEN_KEY);
    deleteCookie(event, REFRESH_TOKEN_KEY);
    deleteCookie(event, EXP_TIME_KEY);

    return result;
  } catch (err: any) {
    // Don't throw — still delete local cookies
    deleteCookie(event, ACCESS_TOKEN_KEY);
    deleteCookie(event, REFRESH_TOKEN_KEY);
    deleteCookie(event, EXP_TIME_KEY);

    return { success: false, message: "Logout completed locally" };
  }
});
