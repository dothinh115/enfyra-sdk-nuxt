import { ref, unref, toRaw } from "vue";
import type {
  ApiOptions,
  BackendErrorExtended,
  UseEnfyraApiReturn,
} from "../types";
import { $fetch } from "../utils/http";
import { useRuntimeConfig } from "#imports";

function handleApiError(error: any, context?: string) {
  let message = "Request failed";
  let errorCode = "UNKNOWN_ERROR";
  let correlationId: string | undefined;

  // Handle backend error response format
  if (error?.response?.data) {
    const responseData = error.response.data as BackendErrorExtended;
    if (responseData.error) {
      message =
        responseData.error.message || responseData.message || "Request failed";
      errorCode = responseData.error.code;
      correlationId = responseData.error.correlationId;
    } else {
      message = responseData.message || "Request failed";
    }
  } else if (error?.data) {
    const errorData = error.data as BackendErrorExtended;
    if (errorData.error) {
      message =
        errorData.error.message || errorData.message || "Request failed";
      errorCode = errorData.error.code;
      correlationId = errorData.error.correlationId;
    } else {
      message = errorData.message || "Request failed";
    }
  } else if (error?.message) {
    message = error.message;
  }

  // You can customize error handling here
  // For now, just log the error
  console.error(`[Enfyra API Error] ${errorCode}: ${message}`, {
    context,
    correlationId,
    error,
  });
}

export function useEnfyraApi<T = any>(
  path: (() => string) | string,
  opts: ApiOptions<T> = {}
): UseEnfyraApiReturn<T> {
  const { method = "get", body, query, errorContext } = opts;
  const data = ref<T | null>(null);
  const error = ref<any>(null);
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
      error.value = err;
      handleApiError(err, errorContext);
      return null;
    } finally {
      pending.value = false;
    }
  };

  return {
    data: data as any,
    error,
    pending,
    execute,
  };
}
