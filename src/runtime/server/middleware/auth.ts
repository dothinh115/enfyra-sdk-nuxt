import { defineEventHandler, getCookie } from "h3";
import { useRuntimeConfig } from "#imports";
import {
  validateTokens,
  refreshAccessToken,
} from "../../../utils/server/refreshToken";
import { REFRESH_TOKEN_KEY } from "../../../constants/auth";

export default defineEventHandler(async (event) => {
  // Skip auth endpoints themselves
  if (
    event.node.req.url === "/api/login" ||
    event.node.req.url === "/api/logout"
  ) {
    return;
  }

  // Validate tokens and get current state
  const { accessToken, needsRefresh } = validateTokens(event);

  let currentAccessToken: string | null = accessToken;

  if (needsRefresh) {
    // Token expired or missing, try to refresh
    const refreshToken = getCookie(event, REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const config = useRuntimeConfig();
        const apiUrl = config.public.enfyraSDK.apiUrl;
        currentAccessToken = await refreshAccessToken(
          event,
          refreshToken,
          apiUrl
        );
      } catch (error) {
        // Refresh failed, token is invalid
        currentAccessToken = null;
      }
    }
  }

  // Set authorization header for all requests if token available
  if (currentAccessToken) {
    event.context.proxyHeaders = event.context.proxyHeaders || {};
    event.context.proxyHeaders.authorization = `Bearer ${currentAccessToken}`;
  }
});
