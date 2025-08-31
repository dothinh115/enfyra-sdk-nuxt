export interface EnfyraConfig {
  apiUrl: string;
  apiPrefix?: string;
  defaultHeaders?: Record<string, string>;
}

export interface ApiOptions<T> {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  errorContext?: string;
  disableBatch?: boolean;
  default?: () => T;
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

export interface UseEnfyraApiReturn<T> {
  data: Ref<T | null>;
  error: Ref<any>;
  pending: Ref<boolean>;
  execute: (executeOpts?: {
    body?: any;
    id?: string | number;
    ids?: (string | number)[];
    files?: any[];
  }) => Promise<T | T[] | null>;
}

// Re-export auth types
export * from './auth';

// Re-export composables types
export * from './composables';