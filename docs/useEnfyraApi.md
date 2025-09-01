# useEnfyraApi Composable Guide

This guide explains how to use the `useEnfyraApi` composable for making API requests in Nuxt applications with the Enfyra SDK.

## Overview

The `useEnfyraApi` composable provides a consistent interface for both client-side and server-side API requests with:

- ✅ **SSR Support**: Automatic server-side rendering with `useFetch` when `ssr: true`
- ✅ **Client-side Rendering**: Manual execution control with `$fetch` for interactive requests
- ✅ **Headers Forwarding**: Automatic authentication and headers forwarding in SSR mode
- ✅ **Automatic error handling** with console logging and error state management
- ✅ **Reactive loading states** for both SSR and client modes
- ✅ **Full TypeScript support** with proper typing
- ✅ **Dynamic ID support** for CRUD operations
- ✅ **Batch operations** with real-time progress tracking (PATCH/DELETE with IDs, POST with files)
- ✅ **Smart TypeScript** - Batch options only appear when using batch-capable methods
- ✅ **Manual execution control** in client mode (never auto-executes)

### SSR vs Client Mode

#### SSR Mode (`ssr: true`)
- **Server-Side Rendering**: Uses `useFetch` internally, perfect for initial page loads
- **Automatic Execution**: Data loads automatically, no need to call `execute()`
- **Headers Forwarding**: Automatically forwards authentication headers from client to API server
- **Caching**: Built-in Nuxt caching with optional cache keys
- **Hydration**: Seamless server-to-client data hydration

#### Client Mode (`ssr: false` or omitted)
- **Client-Side Only**: Uses `$fetch` internally, perfect for interactive applications
- **Manual Control**: Never executes automatically, giving you full control over when API calls happen
- **Better Performance**: Lighter than SSR mode for client-side only interactions
- **Batch Operations**: Full support for batch operations with multiple IDs or files

## Basic Usage

### SSR Mode - For Initial Data Loading

```typescript
// ✅ SSR Mode - Automatic execution, perfect for page initialization
const { data, error, pending, refresh } = useEnfyraApi('/users', {
  ssr: true,
  key: 'users-list', // Optional cache key
  method: 'get',
  query: {
    limit: 10,
    sort: '-createdAt',
  },
});

// Data is available immediately (server-rendered)
// No need to call execute() - data loads automatically
console.log('Users:', data.value?.data);

// Use refresh() to refetch data
const handleRefresh = () => refresh();
```

### Client Mode - For Interactive Operations

```typescript
// ✅ Client Mode - Manual execution, perfect for user interactions
const { data, pending, error, execute } = useEnfyraApi('/users', {
  method: 'get',
  query: computed(() => ({
    limit: 10,
    sort: '-createdAt',
  })),
  errorContext: 'Fetch Users',
});

// Must manually execute
onMounted(async () => {
  await execute();
});

// Execute with dynamic parameters
await execute({ body: { name: 'John' } });
await execute({ id: '123' });
await execute({ id: '123', body: { name: 'Updated Name' } });

// Batch operations (patch/delete methods only)
// 🎯 TypeScript: batchSize, concurrent, onProgress options available when using `ids`
await execute({ ids: ['1', '2', '3'] });
await execute({ 
  ids: ['1', '2'], 
  body: { status: 'inactive' },
  batchSize: 10,
  onProgress: (progress) => console.log(`${progress.completed}/${progress.total}`)
});

// Batch file upload (POST method only)
// 🎯 TypeScript: batch options available when using `files`
await execute({ 
  files: [formData1, formData2, formData3],
  concurrent: 3,
  onProgress: (progress) => updateProgressBar(progress.progress)
});
```

### Dynamic URLs

```typescript
const userId = ref('123');

// ✅ SSR Mode - Reactive URL
const { data } = useEnfyraApi(() => `/users/${userId.value}`, {
  ssr: true,
  key: () => `user-${userId.value}`, // Dynamic cache key
});

// ✅ Client Mode - Reactive URL
const { execute } = useEnfyraApi(() => `/users/${userId.value}`, {
  errorContext: 'Fetch User',
});
```

## API Options

useEnfyraApi accepts the following options:

```typescript
interface ApiOptions<T> {
  /** HTTP method for the request */
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** Request body (for POST/PATCH requests) */
  body?: any;

  /** URL query parameters */
  query?: Record<string, any>;

  /** Custom headers */
  headers?: Record<string, string>;

  /** Context string for error messages (e.g., "Create User") */
  errorContext?: string;

  /** Disable batch operations for multiple IDs */
  disableBatch?: boolean;

  /** Default value function (SSR mode only) */
  default?: () => T;

  // 🎯 Batch Options - Only available for PATCH, DELETE, and POST methods
  /** Batch size for chunking large operations (default: no limit) */
  batchSize?: number;

  /** Maximum concurrent requests (default: no limit) */
  concurrent?: number;

  /** Real-time progress callback for batch operations */
  onProgress?: (progress: BatchProgress) => void;

  /** Enable SSR with useFetch instead of $fetch */
  ssr?: boolean;

  /** Unique key for useFetch caching (SSR mode only) */
  key?: string;
}

// Execute options for dynamic parameters (Client mode only)
interface ExecuteOptions {
  /** Request body for this execution */
  body?: any;

  /** Single ID for resource operations (appends to URL) */
  id?: string | number;

  /** Multiple IDs for batch operations (patch/delete only) */
  ids?: (string | number)[];

  /** Files array for batch POST operations (file uploads) */
  files?: FormData[];

  // 🎯 Batch Options - Only available when using `ids` or `files`
  /** Override batch size for this specific execution */
  batchSize?: number;

  /** Override concurrent limit for this specific execution */
  concurrent?: number;

  /** Override progress callback for this specific execution */
  onProgress?: (progress: BatchProgress) => void;
}
```

### Available HTTP Methods

| Method   | Use Case                 | Body Support | Query Support | SSR Support | Batch Support |
| -------- | ------------------------ | ------------ | ------------- | ----------- | ------------- |
| `get`    | Fetch data               | ❌ No        | ✅ Yes        | ✅ Yes      | ❌ No         |
| `post`   | Create new resource      | ✅ Yes       | ✅ Yes        | ✅ Yes      | ✅ Files only |
| `patch`  | Update existing resource | ✅ Yes       | ✅ Yes        | ✅ Yes      | ✅ IDs        |
| `delete` | Remove resource          | ❌ No        | ✅ Yes        | ✅ Yes      | ✅ IDs        |

### Return Types

```typescript
// useEnfyraApi returns different interfaces based on mode

// SSR Mode - returns useFetch result
interface UseFetchReturn<T> {
  /** Reactive data from the API response */
  data: Ref<T | null>;
  /** Reactive error state */
  error: Ref<any>;
  /** Reactive loading state */
  pending: Ref<boolean>;
  /** Function to refresh the data */
  refresh: () => Promise<void>;
  // ... other useFetch properties
}

// Client Mode - returns custom interface
interface UseEnfyraApiReturn<T> {
  /** Reactive data from the API response */
  data: Ref<T | null>;
  /** Reactive error state (readonly) */
  error: Readonly<Ref<any>>;
  /** Reactive loading state */
  pending: Ref<boolean>;
  /** Function to execute the API call */
  execute: (options?: ExecuteOptions) => Promise<T | T[] | null>;
}
```

## SSR Mode Deep Dive

### When to Enable SSR

The `ssr: true` option fundamentally changes how `useEnfyraApi` behaves. Here's when to use it:

#### ✅ Perfect for SSR Mode:
```typescript
// ✅ Page data loading - pre-render content for SEO
const { data: posts } = useEnfyraApi('/posts', {
  ssr: true,
  key: 'blog-posts'
});

// ✅ User profile data - show immediately on page load  
const { data: profile } = useEnfyraApi('/me', {
  ssr: true,
  key: 'current-user'
});

// ✅ Public data - categories, settings, etc.
const { data: categories } = useEnfyraApi('/categories', {
  ssr: true,
  key: 'categories-list'
});
```

#### ❌ Don't use SSR Mode for:
```typescript
// ❌ User interactions - use Client mode instead
const { execute: deletePost } = useEnfyraApi('/posts', {
  method: 'delete',
  // ssr: false (default) - manual execution needed
});

// ❌ Form submissions - use Client mode
const { execute: createPost } = useEnfyraApi('/posts', {
  method: 'post',
  // ssr: false (default) - controlled execution
});

// ❌ Batch operations - not supported in SSR
const { execute: bulkDelete } = useEnfyraApi('/posts', {
  method: 'delete',
  // ssr: false (default) - needs execute() with ids
});
```

### SSR Mode Limitations

**❌ No `execute()` function** - Data loads automatically:
```typescript
// ❌ Wrong - execute() doesn't exist in SSR mode
const { data, execute } = useEnfyraApi('/posts', { ssr: true });
await execute(); // TypeError: execute is not a function

// ✅ Right - use refresh() instead
const { data, refresh } = useEnfyraApi('/posts', { ssr: true });
await refresh(); // Re-fetch data
```

**❌ No Batch Operations** - Single requests only:
```typescript
// ❌ Wrong - batch operations not available in SSR
const { execute } = useEnfyraApi('/posts', { 
  ssr: true,
  method: 'delete' 
});
await execute({ ids: ['1', '2', '3'] }); // execute is undefined

// ✅ Right - use Client mode for batch operations  
const { execute } = useEnfyraApi('/posts', {
  method: 'delete',
  errorContext: 'Delete Posts'
});
await execute({ ids: ['1', '2', '3'] }); // Works perfectly
```

**❌ No Dynamic Execution Parameters** - Set at initialization:
```typescript
// ❌ Wrong - can't change body/query dynamically in SSR
const { data, execute } = useEnfyraApi('/posts', { ssr: true });
await execute({ body: newData }); // execute is undefined

// ✅ Right - use reactive refs for dynamic data
const searchQuery = ref('');
const { data } = useEnfyraApi('/posts', {
  ssr: true,
  query: computed(() => ({ search: searchQuery.value }))
});

// Change searchQuery.value to trigger reactivity
```

### SSR vs Client Mode Comparison

| Feature | SSR Mode (`ssr: true`) | Client Mode (default) |
|---------|----------------------|----------------------|
| **Execution** | Automatic | Manual via `execute()` |
| **Data Loading** | Server + Client | Client only |
| **Caching** | Built-in Nuxt cache | No caching |
| **Headers** | Auto-forwarded | Manual setup |
| **Batch Operations** | ❌ Not supported | ✅ Full support |
| **Dynamic Parameters** | Reactive refs only | `execute()` options |
| **SEO Benefits** | ✅ Pre-rendered | ❌ Client-side only |
| **Loading States** | Built-in | Manual management |
| **Error Handling** | Nuxt error handling | Console + error state |

## SSR Authentication & Headers

In SSR mode, `useEnfyraApi` automatically forwards important headers from the client request to the API server:

```typescript
// Automatically forwarded headers in SSR mode:
const forwardedHeaders = [
  'authorization',     // JWT tokens
  'cookie',           // Session cookies
  'user-agent',       // Client information
  'accept',           // Content type preferences
  'accept-language',  // Locale information
  'referer'           // Origin information
];

// Filtered out (connection-specific headers):
const filteredHeaders = [
  'connection',
  'keep-alive', 
  'host',
  'content-length'
];
```

This means authentication works seamlessly in SSR mode:

```typescript
// ✅ This will work with user's auth token on server
const { data: userData } = useEnfyraApi('/me', {
  ssr: true,
  key: 'current-user'
});

// User data is available immediately on page load
// No login required on client - server already authenticated
```

## Error Handling

### SSR Mode Error Handling

```typescript
const { data, error } = useEnfyraApi('/users', {
  ssr: true,
  key: 'users',
  default: () => ({ data: [], meta: { totalCount: 0 } }) // Fallback value
});

// Check error state
if (error.value) {
  console.log('SSR Error:', error.value);
}

// Use default value when error occurs
const users = computed(() => data.value?.data || []);
```

### Client Mode Error Handling

```typescript
const { data, error, execute } = useEnfyraApi('/users', {
  errorContext: 'Create User', // Shows in console: "Create User: [error message]"
});

async function handleSubmit() {
  await execute({ body: formData });

  if (error.value) {
    // Error already logged to console
    return;
  }

  // Success handling
  toast.add({ title: 'Success', color: 'green' });
}
```

## Common Patterns

### Page Data Loading (SSR)

```typescript
// pages/users.vue
<script setup>
import type { User, ApiListResponse } from '~/types';

// ✅ Perfect for page data - loads on server, caches on client
const { data: usersData, pending, error, refresh } = useEnfyraApi<ApiListResponse<User>>('/users', {
  ssr: true,
  key: 'users-list',
  query: {
    page: 1,
    limit: 20,
    sort: '-createdAt'
  }
});

const users = computed(() => usersData.value?.data || []);
const total = computed(() => usersData.value?.meta?.totalCount || 0);

// Handle refresh
const handleRefresh = () => refresh();
</script>

<template>
  <div>
    <div v-if="pending">Loading users...</div>
    <div v-else-if="error">Error loading users</div>
    <div v-else>
      <UserList :users="users" />
      <Pagination :total="total" />
      <button @click="handleRefresh">Refresh</button>
    </div>
  </div>
</template>
```

### User Interactions (Client Mode)

```typescript
// components/UserManager.vue
<script setup>
import type { User, ApiDetailResponse } from '~/types';

// Define types first
interface ApiListResponse<T> {
  data: T[];
  meta: { totalCount: number };
}

interface ApiDetailResponse<T> {
  data: T;
}

// 1. CREATE - Add new user (Client mode for interactions)
const { execute: createUser, error: createError, pending: createPending } = useEnfyraApi<ApiDetailResponse<User>>('/users', {
  method: 'post',
  errorContext: 'Create User',
});

// 2. UPDATE - Modify existing user
const { execute: updateUser, error: updateError } = useEnfyraApi<ApiDetailResponse<User>>('/users', {
  method: 'patch',
  errorContext: 'Update User',
});

// 3. DELETE - Remove user
const { execute: deleteUser, error: deleteError } = useEnfyraApi<{ success: boolean }>('/users', {
  method: 'delete',
  errorContext: 'Delete User',
});

// Usage examples
async function handleCreateUser(userData: Partial<User>) {
  const newUser = await createUser({
    body: userData,
  });

  if (!createError.value) {
    console.log('Created user:', newUser?.data);
    toast.add({ title: 'User created successfully' });
  }
}

async function handleUpdateUser(userId: string, updates: Partial<User>) {
  await updateUser({
    id: userId,
    body: updates,
  });

  if (!updateError.value) {
    toast.add({ title: 'User updated successfully' });
  }
}

async function handleDeleteUser(userId: string) {
  await deleteUser({ id: userId });

  if (!deleteError.value) {
    toast.add({ title: 'User deleted successfully' });
  }
}

// Batch operations
async function handleBulkDelete(userIds: string[]) {
  await deleteUser({ ids: userIds });

  if (!deleteError.value) {
    toast.add({ title: `${userIds.length} users deleted` });
  }
}
</script>
```

### Reactive Parameters

```typescript
const page = ref(1);
const search = ref('');

// ✅ SSR Mode - Reactive query with watchers
const { data, refresh } = useEnfyraApi('/users', {
  ssr: true,
  key: () => `users-${page.value}-${search.value}`, // Dynamic cache key
  query: computed(() => ({
    page: page.value,
    search: search.value,
    limit: 10,
  })),
});

// Watch for changes and refresh
watch([page, search], () => refresh());

// ✅ Client Mode - Reactive query with manual execution
const { data, execute } = useEnfyraApi('/users', {
  query: computed(() => ({
    page: page.value,
    search: search.value,
    limit: 10,
  })),
  errorContext: 'Fetch Users',
});

// Watch for changes and re-execute
watch([page, search], async () => await execute());

// Initial load
onMounted(async () => await execute());
```

## Batch Operations

### Batch Delete/Patch with Multiple IDs (Client Mode Only)

```typescript
// Batch delete multiple users
const { execute: deleteUsers } = useEnfyraApi('/users', {
  method: 'delete',
  errorContext: 'Delete Users',
});

// Delete multiple users at once
await deleteUsers({ ids: ['1', '2', '3'] });

// Batch update multiple users
const { execute: updateUsers } = useEnfyraApi('/users', {
  method: 'patch',
  errorContext: 'Update Users',
});

// Update multiple users with same data
await updateUsers({
  ids: ['user1', 'user2'],
  body: { isActive: true },
});
```

### Batch File Upload (Client Mode Only)

```typescript
// Batch file upload
const { execute: uploadFiles } = useEnfyraApi('/files', {
  method: 'post',
  errorContext: 'Upload Files',
});

// Upload multiple files with different metadata
await uploadFiles({
  files: [
    createFileFormData(file1, folderId1),
    createFileFormData(file2, folderId2),
    createFileFormData(file3, folderId3),
  ],
});

// Helper function to create FormData for each file
function createFileFormData(file: File, folderId: string | null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folderId || '');
  return formData;
}
```

**Batch Operation Notes:**
- Only available in **Client Mode** (not SSR)
- PATCH/DELETE: Uses `ids` array for multiple resources
- POST: Uses `files` array for multiple file uploads
- Uses `Promise.all` for parallel execution
- Returns array of responses

## Best Practices

### 1. Choose the Right Mode

```typescript
// ✅ Use SSR mode for initial page data
const { data: pageData } = useEnfyraApi('/dashboard', {
  ssr: true,
  key: 'dashboard-data'
});

// ✅ Use Client mode for user interactions
const { execute: saveSettings } = useEnfyraApi('/settings', {
  method: 'patch',
  errorContext: 'Save Settings'
});
```

### 2. Always Use at Setup Level

```typescript
// ✅ Correct - at setup level with dynamic ID support
const { execute: deleteItem } = useEnfyraApi('/items', {
  method: 'delete',
  errorContext: 'Delete Item',
});

async function handleDelete(id: string) {
  await deleteItem({ id });
}

// ❌ Wrong - inside function (violates Composition API rules)
async function handleDelete(id: string) {
  const { execute } = useEnfyraApi(`/items/${id}`, {
    method: 'delete',
  });
  await execute();
}
```

### 3. Provide Error Context (Client Mode)

```typescript
const { execute } = useEnfyraApi('/users', {
  method: 'post',
  errorContext: 'Create User', // Console shows: "Create User: Network error"
});
```

### 4. Use Cache Keys Effectively (SSR Mode)

```typescript
// ✅ Static cache key
const { data } = useEnfyraApi('/users', {
  ssr: true,
  key: 'all-users'
});

// ✅ Dynamic cache key based on parameters
const userId = ref('123');
const { data } = useEnfyraApi(() => `/users/${userId.value}`, {
  ssr: true,
  key: () => `user-${userId.value}` // Cache per user
});

// ✅ Cache key with query parameters
const page = ref(1);
const { data } = useEnfyraApi('/users', {
  ssr: true,
  key: () => `users-page-${page.value}`,
  query: computed(() => ({ page: page.value }))
});
```

### 5. Handle Loading States

```vue
<template>
  <!-- SSR Mode -->
  <LoadingSpinner v-if="pending" />
  <UserList v-else-if="data" :users="data.data" />
  <ErrorMessage v-else-if="error" :error="error" />

  <!-- Client Mode -->
  <button @click="handleSubmit" :disabled="pending">
    {{ pending ? 'Saving...' : 'Save' }}
  </button>
</template>

<script setup>
// SSR Mode
const { data, pending, error } = useEnfyraApi('/users', {
  ssr: true,
  key: 'users'
});

// Client Mode  
const { execute, pending: savePending } = useEnfyraApi('/users', {
  method: 'post',
  errorContext: 'Save User'
});
</script>
```

### 6. Type Safety

```typescript
// Define your data models
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Define API response structures
interface ApiResponse<T> {
  data: T[];
  meta?: {
    totalCount: number;
    page: number;
    limit: number;
  };
}

interface ApiDetailResponse<T> {
  data: T;
}

// Use with full type safety
const { data } = useEnfyraApi<ApiResponse<User>>('/users', {
  ssr: true,
  key: 'users'
});

// TypeScript knows data.value is ApiResponse<User> | null
const users = computed(() => data.value?.data || []);
const total = computed(() => data.value?.meta?.totalCount || 0);
```

### 7. Never Use Try-Catch in Client Mode

**❌ WRONG - Don't do this:**

```typescript
async function deleteUser() {
  try {
    await executeDeleteUser();
    toast.add({ title: 'Success' });
  } catch (error) {
    // ❌ This is wrong! Error handling is already automatic
    console.log('Error:', error);
  }
}
```

**✅ CORRECT - Do this instead:**

```typescript
const { execute: deleteUser, error: deleteError } = useEnfyraApi('/users', {
  method: 'delete',
  errorContext: 'Delete User',
});

async function handleDelete(userId: string) {
  await deleteUser({ id: userId });

  if (deleteError.value) {
    return; // Error already handled by useEnfyraApi
  }

  toast.add({ title: 'User deleted successfully' });
}
```

## Troubleshooting

### Common Issues

1. **"Headers not forwarded in SSR"**
   - Ensure you're using `ssr: true` option
   - Check that authentication headers exist in the original request

2. **"Batch operations not working"**
   - Batch operations only work in Client mode, not SSR mode
   - Ensure you're using correct method (PATCH/DELETE for IDs, POST for files)
   - Check that you're providing `ids` or `files` parameters to trigger batch mode

3. **"Data not reactive in SSR"**
   - Use `refresh()` to update SSR data
   - Consider using `key` with reactive values for cache invalidation

4. **"Composable called inside function"**
   - Move all composables to setup level
   - Use dynamic IDs with `{ id }` parameter instead

5. **"TypeScript errors"**
   - Use `pending` not `loading` in destructuring
   - Ensure composables are at setup level
   - Check return type differences between SSR and Client modes

6. **"Batch options not showing in IntelliSense"**
   - Batch options (`batchSize`, `concurrent`, `onProgress`) only appear for PATCH, DELETE, and POST methods
   - For execute options, batch parameters only show when using `ids` or `files`

### Performance Tips

1. **Use SSR for initial data** - Faster page loads
2. **Use Client mode for interactions** - Better UX for forms
3. **Cache keys strategically** - Avoid over-caching dynamic data
4. **Batch operations wisely** - Group related operations

## Migration Guide

### From Direct $fetch

```typescript
// ❌ Before - manual $fetch with boilerplate
async function fetchUsers() {
  try {
    loading.value = true;
    const response = await $fetch('/api/users');
    users.value = response.data;
  } catch (error) {
    toast.add({ title: 'Error', description: error.message });
  } finally {
    loading.value = false;
  }
}

// ✅ After - clean useEnfyraApi approach
const { data, pending, execute } = useEnfyraApi<ApiResponse<User>>('/users', {
  errorContext: 'Fetch Users',
});

const users = computed(() => data.value?.data || []);
onMounted(() => execute());
```

### From useFetch

```typescript
// ❌ Before - manual useFetch setup
const { data, pending, error } = await useFetch('/api/users', {
  key: 'users',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ After - useEnfyraApi with automatic headers
const { data, pending, error } = useEnfyraApi('/users', {
  ssr: true,
  key: 'users'
  // Headers automatically forwarded from client request
});
```

## Summary

**Choose the right mode for your use case:**

### SSR Mode (`ssr: true`)
- ✅ Perfect for initial page data loading
- ✅ Automatic server-side rendering and caching  
- ✅ Headers forwarding for authentication
- ✅ SEO-friendly with pre-rendered data
- ❌ No batch operations support
- ❌ No progress tracking for bulk operations
- ❌ No manual execution control

### Client Mode (default)
- ✅ Perfect for user interactions and forms
- ✅ Manual execution control prevents unexpected API calls
- ✅ Full batch operations with real-time progress tracking
- ✅ Smart TypeScript - batch options only for compatible methods
- ✅ Lighter weight for interactive features
- ❌ No SSR benefits
- ❌ Requires manual error handling checks

**Key Rules:**
- Always provide `errorContext` for better error messages in Client mode
- Keep composables at setup level, never inside functions
- Use computed refs for reactive parameters  
- Check `error.value` instead of using try-catch in Client mode
- Use dynamic IDs with `{ id }` parameter for flexibility
- Choose SSR for page data, Client mode for interactions