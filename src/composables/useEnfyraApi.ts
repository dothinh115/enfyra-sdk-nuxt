import { ref, unref, toRaw } from "vue";
import type {
  ApiOptions,
  ApiError,
  BackendErrorExtended,
  UseEnfyraApiSSRReturn,
  UseEnfyraApiClientReturn,
} from "../types";
import { $fetch } from "../utils/http";
import { useRuntimeConfig, useFetch, useRequestHeaders } from "#imports";

function handleError(
  error: any,
  context?: string,
  customHandler?: (error: ApiError, context?: string) => void
) {
  // Transform error to ApiError format
  const apiError: ApiError = {
    message: error?.message || error?.data?.message || "Request failed",
    status: error?.status || error?.response?.status,
    data: error?.data || error?.response?.data,
    response: error?.response || error
  };

  if (customHandler) {
    customHandler(apiError, context);
  } else {
    console.error(`[Enfyra API Error]`, { error: apiError, context });
  }

  return apiError;
}

// Function overloads for proper TypeScript support
export function useEnfyraApi<T = any>(
  path: (() => string) | string,
  opts: ApiOptions<T> & { ssr: true }
): UseEnfyraApiSSRReturn<T>;

export function useEnfyraApi<T = any>(
  path: (() => string) | string,
  opts?: ApiOptions<T> & { ssr?: false | undefined }
): UseEnfyraApiClientReturn<T>;

export function useEnfyraApi<T = any>(
  path: (() => string) | string,
  opts: ApiOptions<T> = {}
): UseEnfyraApiSSRReturn<T> | UseEnfyraApiClientReturn<T> {
  const { method = "get", body, query, errorContext, onError, ssr, key } = opts;

  // SSR mode - use useFetch
  if (ssr) {
    const config = useRuntimeConfig().public.enfyraSDK;
    const basePath = (typeof path === "function" ? path() : path)
      .replace(/^\/?api\/?/, "")
      .replace(/^\/+/, ""); // Remove leading slashes

    const finalUrl =
      (config?.appUrl || "") + (config?.apiPrefix || "") + "/" + basePath;

    // Get headers from client request and filter out connection-specific headers
    const clientHeaders = process.client
      ? {}
      : useRequestHeaders([
          "authorization",
          "cookie",
          "user-agent",
          "accept",
          "accept-language",
          "referer",
        ]);

    // Remove connection-specific headers that shouldn't be forwarded
    const serverHeaders = { ...clientHeaders };
    delete serverHeaders.connection;
    delete serverHeaders["keep-alive"];
    delete serverHeaders.host;
    delete serverHeaders["content-length"];

    const fetchOptions: any = {
      method: method as any,
      body: body,
      query: query,
      headers: {
        ...serverHeaders,
        ...opts.headers, // Custom headers override client headers
      },
    };

    // Only add useFetch-specific options if provided
    if (key) {
      fetchOptions.key = key;
    }
    if (opts.default) {
      fetchOptions.default = opts.default;
    }

    return useFetch<T>(finalUrl, fetchOptions) as UseEnfyraApiSSRReturn<T>;
  }
  const data = ref<T | null>(null);
  const error = ref<ApiError | null>(null);
  const pending = ref(false);

  const execute = async (executeOpts?: {
    body?: any;
    id?: string | number;
    ids?: (string | number)[];
    files?: any[];
  }) => {
    pending.value = true;
    error.value = null;

    try {
      // Get config from Nuxt app (inside execute to avoid SSR issues)
      const config: any = useRuntimeConfig().public.enfyraSDK;
      const apiUrl = config?.appUrl;
      const apiPrefix = config?.apiPrefix;
      const basePath = (typeof path === "function" ? path() : path)
        .replace(/^\/?api\/?/, "")
        .replace(/^\/+/, ""); // Remove leading slashes
      const finalBody = executeOpts?.body || unref(body);
      const finalQuery = unref(query);

      // Helper function to build clean path
      const buildPath = (...segments: (string | number)[]): string => {
        return segments.filter(Boolean).join("/");
      };

      // Build full base URL with prefix
      const fullBaseURL = apiUrl + (apiPrefix || "");

      // Batch operation with multiple IDs (only for patch and delete)
      if (
        !opts.disableBatch &&
        executeOpts?.ids &&
        executeOpts.ids.length > 0 &&
        (method.toLowerCase() === "patch" || method.toLowerCase() === "delete")
      ) {
        const promises = executeOpts.ids.map(async (id) => {
          const finalPath = buildPath(basePath, id);
          return $fetch<T>(finalPath, {
            baseURL: fullBaseURL,
            method: method as any,
            body: finalBody ? toRaw(finalBody) : undefined,
            headers: opts.headers,
            query: finalQuery,
          });
        });

        const responses = await Promise.all(promises);
        data.value = responses as T;
        return responses;
      }

      // Batch operation with files array for POST method
      if (
        !opts.disableBatch &&
        method.toLowerCase() === "post" &&
        executeOpts?.files &&
        Array.isArray(executeOpts.files) &&
        executeOpts.files.length > 0
      ) {
        const promises = executeOpts.files.map(async (fileObj: any) => {
          return $fetch<T>(basePath, {
            baseURL: fullBaseURL,
            method: method as any,
            body: fileObj, // {file: file1, folder: null}
            headers: opts.headers,
            query: finalQuery,
          });
        });

        const responses = await Promise.all(promises);
        data.value = responses as T;
        return responses;
      }

      // Single operation with single ID
      const finalPath = executeOpts?.id
        ? buildPath(basePath, executeOpts.id)
        : basePath;

      const response = await $fetch<T>(finalPath, {
        baseURL: fullBaseURL,
        method: method as any,
        body: finalBody ? toRaw(finalBody) : undefined,
        headers: opts.headers,
        query: finalQuery,
      });

      data.value = response;
      return response;
    } catch (err) {
      const apiError = handleError(err, errorContext, onError);
      error.value = apiError;
      return null;
    } finally {
      pending.value = false;
    }
  };

  return {
    data,
    error,
    pending,
    execute,
  } as UseEnfyraApiClientReturn<T>;
}
