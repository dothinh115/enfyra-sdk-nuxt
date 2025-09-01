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

export interface BatchProgress {
  /** Current progress percentage (0-100) */
  progress: number;
  /** Number of completed operations */
  completed: number;
  /** Total number of operations */
  total: number;
  /** Number of failed operations */
  failed: number;
  /** Number of operations currently in progress */
  inProgress: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;
  /** Average time per operation in milliseconds */
  averageTime?: number;
  /** Current batch being processed */
  currentBatch: number;
  /** Total number of batches */
  totalBatches: number;
  /** Processing speed (operations per second) */
  operationsPerSecond?: number;
  /** Detailed results array for completed operations */
  results: Array<{
    index: number;
    status: 'completed' | 'failed';
    result?: any;
    error?: ApiError;
    duration?: number;
  }>;
}

// Base options available for all operations
interface BaseApiOptions<T> {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  errorContext?: string;
  onError?: (error: ApiError, context?: string) => void;
  disableBatch?: boolean;
  default?: () => T;
  /** Enable SSR with useFetch instead of $fetch */
  ssr?: boolean;
  /** Unique key for useFetch caching */
  key?: string;
}

// Batch-specific options (only available for batch operations)
interface BatchApiOptions {
  /** Batch size for chunking large operations (default: no limit) - Only available for batch operations */
  batchSize?: number;
  /** Maximum concurrent requests (default: no limit) - Only available for batch operations */
  concurrent?: number;
  /** Real-time progress callback for batch operations - Only available for batch operations */
  onProgress?: (progress: BatchProgress) => void;
}

// Conditional type that adds batch options only for batch-capable methods
type ConditionalBatchOptions<T> = T extends { method?: 'patch' | 'delete' | 'PATCH' | 'DELETE' }
  ? BatchApiOptions
  : T extends { method?: 'post' | 'POST' }
  ? BatchApiOptions  // POST supports file batch uploads
  : T extends { method?: undefined } // Default method is 'get', but could be overridden at execution
  ? Partial<BatchApiOptions>  // Allow batch options but make them optional since method could change
  : {};

// Main ApiOptions interface with conditional batch support
export type ApiOptions<T> = BaseApiOptions<T> & ConditionalBatchOptions<BaseApiOptions<T>>;

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
// Base execute options available for all operations
interface BaseExecuteOptions {
  body?: any;
  id?: string | number;
}

// Batch execute options (only available when doing batch operations)
interface BatchExecuteOptions {
  ids?: (string | number)[];
  /** Array of FormData objects for batch upload */
  files?: FormData[];
  /** Override batch size for this specific execution */
  batchSize?: number;
  /** Override concurrent limit for this specific execution */
  concurrent?: number;
  /** Override progress callback for this specific execution */
  onProgress?: (progress: BatchProgress) => void;
}

// Conditional execute options based on what's being executed
type ConditionalExecuteOptions<T> = T extends { ids: any }
  ? BatchExecuteOptions // If ids provided, enable all batch options
  : T extends { files: any }
  ? BatchExecuteOptions // If files provided, enable all batch options  
  : BaseExecuteOptions & Partial<BatchExecuteOptions>; // Otherwise base options + optional batch options

export type ExecuteOptions = BaseExecuteOptions & BatchExecuteOptions;

// Client Mode return type
export interface UseEnfyraApiClientReturn<T> {
  data: Ref<T | null>;
  error: Ref<ApiError | null>;
  pending: Ref<boolean>;
  execute: (executeOpts?: ExecuteOptions) => Promise<T | T[] | null>;
}


// Re-export auth types
export * from './auth';

