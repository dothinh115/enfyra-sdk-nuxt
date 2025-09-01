export interface EnfyraConfig {
  apiUrl: string;
  apiPrefix?: string;
  defaultHeaders?: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  response?: any;
}

export interface ApiOptions<T> {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  errorContext?: string;
  onError?: (error: ApiError, context?: string) => void;
  disableBatch?: boolean;
  /** Batch size for chunking large operations (default: no limit) */
  batchSize?: number;
  /** Maximum concurrent requests (default: no limit) */
  concurrent?: number;
  default?: () => T;
  /** Enable SSR with useFetch instead of $fetch */
  ssr?: boolean;
  /** Unique key for useFetch caching */
  key?: string;
}

export interface BackendError {
  success: false;
  message: string;
}

export interface BackendErrorExtended extends BackendError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
    correlationId?: string;
  };
}

import type { Ref } from 'vue';
import type { AsyncData } from 'nuxt/app';

// SSR Mode return type (same as useFetch)
export interface UseEnfyraApiSSRReturn<T> extends AsyncData<T | null, ApiError> {
  data: Ref<T | null>;
  pending: Ref<boolean>;
  error: Ref<ApiError | null>;
  refresh: () => Promise<void>;
}

// Execute options interface
export interface ExecuteOptions {
  body?: any;
  id?: string | number;
  ids?: (string | number)[];
  /** Array of FormData objects for batch upload */
  files?: FormData[];
  /** Override batch size for this specific execution */
  batchSize?: number;
  /** Override concurrent limit for this specific execution */
  concurrent?: number;
}

// Client Mode return type
export interface UseEnfyraApiClientReturn<T> {
  data: Ref<T | null>;
  error: Ref<ApiError | null>;
  pending: Ref<boolean>;
  execute: (executeOpts?: ExecuteOptions) => Promise<T | T[] | null>;
}


// Re-export auth types
export * from './auth';

