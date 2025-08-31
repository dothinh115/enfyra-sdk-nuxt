import { H3Event, proxyRequest } from "h3";
import { useRuntimeConfig } from "#imports";

export function proxyToAPI(event: H3Event, customPath?: string) {
  const config = useRuntimeConfig();
  const apiPrefix = config.public.enfyraSDK.apiPrefix;
  const rawPath =
    customPath || event.path.replace(new RegExp(`^${apiPrefix}`), "");
  const targetUrl = `${config.public.enfyraSDK.apiUrl}${rawPath}`;

  // Forward original headers and add auth headers from middleware
  const headers = event.context.proxyHeaders || {};

  return proxyRequest(event, targetUrl, {
    headers,
  });
}
