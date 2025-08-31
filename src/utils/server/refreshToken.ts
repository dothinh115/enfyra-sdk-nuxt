import { setCookie, getCookie, type H3Event } from "h3";
import { $fetch } from "ofetch";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  EXP_TIME_KEY,
} from "../../constants/auth";

interface TokenValidationResult {
  accessToken: string | null;
  needsRefresh: boolean;
}

export function validateTokens(event: H3Event): TokenValidationResult {
  const accessToken = getCookie(event, ACCESS_TOKEN_KEY);
  const refreshToken = getCookie(event, REFRESH_TOKEN_KEY);
  const expTime = getCookie(event, EXP_TIME_KEY);

  // Check if access token is expired
  const isTokenExpired = expTime && Date.now() > parseInt(expTime) * 1000;

  if (accessToken && !isTokenExpired) {
    // Token is valid, use it
    return { accessToken, needsRefresh: false };
  } else if (refreshToken && (isTokenExpired || !accessToken)) {
    // Token expired or missing, needs refresh
    return { accessToken: null, needsRefresh: true };
  }

  // No valid tokens
  return { accessToken: null, needsRefresh: false };
}

export async function refreshAccessToken(
  event: H3Event,
  refreshToken: string,
  apiUrl: string
): Promise<string> {
  try {
    const response = await $fetch(`${apiUrl}/auth/refresh-token`, {
      method: "POST",
      body: { refreshToken },
    });

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expTime: newExpTime,
    } = response;

    // Update cookies with new tokens
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    };

    setCookie(event, ACCESS_TOKEN_KEY, newAccessToken, cookieOptions);
    setCookie(event, REFRESH_TOKEN_KEY, newRefreshToken, cookieOptions);
    setCookie(event, EXP_TIME_KEY, String(newExpTime), cookieOptions);

    return newAccessToken;
  } catch (error) {
    console.warn("Token refresh failed:", error);
    throw error;
  }
}
