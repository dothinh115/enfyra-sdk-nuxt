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

export function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.warn("Failed to decode JWT:", error);
    return null;
  }
}

export function isAccessTokenExpired(accessToken: string): boolean {
  const decoded = decodeJWT(accessToken);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  // JWT exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
}

export function validateTokens(event: H3Event): TokenValidationResult {
  const accessToken = getCookie(event, ACCESS_TOKEN_KEY);
  const refreshToken = getCookie(event, REFRESH_TOKEN_KEY);

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return { accessToken, needsRefresh: false };
  } else if (refreshToken && (!accessToken || isAccessTokenExpired(accessToken))) {
    return { accessToken: null, needsRefresh: true };
  }

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
