# @enfyra/sdk-nuxt

Nuxt SDK for Enfyra CMS - A powerful composable-based API client with full SSR support and TypeScript integration.

## Features

✅ **SSR & Client-Side Support** - Automatic server-side rendering with `useFetch` or client-side with `$fetch`  
✅ **Authentication Integration** - Built-in auth composables with automatic header forwarding  
✅ **Asset Proxy** - Automatic `/assets/**` proxy to backend with no configuration needed  
✅ **TypeScript Support** - Full type safety with auto-generated declarations  
✅ **Batch Operations** - Efficient bulk operations with real-time progress tracking (client-side)  
✅ **Error Handling** - Automatic error management with console logging  
✅ **Reactive State** - Built-in loading, error, and data states  
✅ **Caching Support** - Optional cache keys for SSR mode optimization  

## Installation

```bash
npm install @enfyra/sdk-nuxt
```

## Setup

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["@enfyra/sdk-nuxt"],
  enfyraSDK: {
    apiUrl: "http://localhost:1105",
    appUrl: "http://localhost:3001",
  },
})
```

## Quick Start

### SSR Mode - Perfect for Page Data

```typescript
// pages/users.vue
<script setup>
// ✅ Automatic execution on server-side with caching (runs immediately, no execute() needed)
const { data: users, pending, error, refresh } = useEnfyraApi('/users', {
  ssr: true,
  key: 'users-list' // Optional cache key
});
</script>

<template>
  <div>
    <div v-if="pending">Loading users...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <h1>Users ({{ users?.meta?.totalCount }})</h1>
      <UserCard v-for="user in users?.data" :key="user.id" :user="user" />
      <button @click="refresh">Refresh</button>
    </div>
  </div>
</template>
```

### Client Mode - Perfect for User Interactions

```typescript
// components/CreateUserForm.vue  
<script setup>
// ✅ Manual execution control for form submissions
const { execute: createUser, pending, error } = useEnfyraApi('/users', {
  method: 'post',
  errorContext: 'Create User'
});

const formData = reactive({
  name: '',
  email: ''
});

async function handleSubmit() {
  await createUser({ body: formData });
  
  if (!error.value) {
    toast.success('User created successfully!');
    await navigateTo('/users');
  }
}
</script>
```

### Authentication

```typescript
<script setup>
const { me, login, logout, isLoggedIn } = useEnfyraAuth();

// Login
await login({
  email: 'user@example.com',
  password: 'password123'
});

// Check auth status
console.log('Logged in:', isLoggedIn.value);
console.log('Current user:', me.value);

// Logout  
await logout();
</script>
```

### Asset URLs - Automatic Proxy

The SDK automatically proxies all asset requests to your backend. Simply use `/assets/**` paths directly:

```vue
<template>
  <!-- ✅ Assets are automatically proxied to your backend -->
  <img src="/assets/images/logo.svg" alt="Logo" />
  <img :src="`/assets/images/users/${user.id}/avatar.jpg`" alt="Avatar" />
  
  <!-- Works with any asset type -->
  <video src="/assets/videos/intro.mp4" controls />
  <a :href="`/assets/documents/${doc.filename}`" download>Download PDF</a>
</template>
```

**How it works:**
- All requests to `/assets/**` are automatically proxied to `{apiUrl}/enfyra/api/assets/**`
- No configuration needed - works out of the box
- Supports all asset types: images, videos, documents, etc.
- Maintains proper authentication headers

## Core Composables

### `useEnfyraApi<T>(path, options)`

Main composable for API requests with both SSR and client-side support.

```typescript
// SSR Mode - Runs immediately (like useFetch)
const { data, pending, error, refresh } = useEnfyraApi('/endpoint', {
  ssr: true,
  key: 'cache-key', // Optional
  method: 'get',
  query: { page: 1 }
});
// ⚠️  Returns useFetch result: { data, pending, error, refresh }

// Client Mode - Manual execution  
const { data, pending, error, execute } = useEnfyraApi('/endpoint', {
  method: 'post',
  errorContext: 'Create Resource'
});
// ⚠️  Returns custom result: { data, pending, error, execute }

await execute({ 
  body: { name: 'New Item' },
  id: '123'  // For /endpoint/123
});
```

**Options:**
- `ssr?: boolean` - Enable server-side rendering mode (executes immediately like useFetch)
- `method?: 'get' | 'post' | 'patch' | 'delete'` - HTTP method
- `body?: any` - Request body (POST/PATCH)
- `query?: Record<string, any>` - URL query parameters
- `headers?: Record<string, string>` - Custom headers
- `errorContext?: string` - Error context for logging
- `onError?: (error: ApiError, context?: string) => void` - Custom error handler
- `key?: string` - Cache key (SSR mode, optional)
- `default?: () => T` - Default value (SSR mode only)

**Batch Options (only available for PATCH, DELETE, and POST methods):**
- `batchSize?: number` - Batch size for chunking large operations (default: no limit)
- `concurrent?: number` - Maximum concurrent requests (default: no limit)
- `onProgress?: (progress: BatchProgress) => void` - Real-time progress callback for batch operations

> 🎯 **TypeScript Smart:** Batch options (`batchSize`, `concurrent`, `onProgress`) are only available in TypeScript IntelliSense when using methods that support batch operations (PATCH, DELETE, POST). For GET and PUT methods, these options won't appear in autocomplete.

**⚠️ Important: Return Types Differ**
- **SSR Mode**: Returns `useFetch` result `{ data, pending, error, refresh }`
- **Client Mode**: Returns custom result `{ data, pending, error, execute }`

**Execute Options (Client mode only):**

**Basic Options:**
- `id?: string | number` - Single resource ID
- `body?: any` - Override request body

**Batch Options (only when using `ids` or `files`):**
- `ids?: (string | number)[]` - Batch operation IDs (PATCH/DELETE)
- `files?: FormData[]` - Array of FormData objects for batch upload (POST)
- `batchSize?: number` - Override batch size for this execution
- `concurrent?: number` - Override concurrent limit for this execution
- `onProgress?: (progress: BatchProgress) => void` - Override progress callback for this execution

> 🎯 **TypeScript Smart:** Batch execute options (`batchSize`, `concurrent`, `onProgress`) are only available when you provide `ids` or `files` parameters, ensuring type safety.

### `useEnfyraAuth()`

Authentication composable with reactive state management.

```typescript
const { me, login, logout, fetchUser, isLoggedIn } = useEnfyraAuth();

// Properties
me.value          // Current user data (reactive)
isLoggedIn.value  // Auth status (computed)

// Methods  
await login({ email, password })  // Login user
await logout()                    // Logout user  
await fetchUser()                 // Refresh user data
```

## Advanced Usage

### Batch Operations

```typescript
// Basic batch delete - unlimited parallel requests
// 🎯 Note: Batch options only appear in IntelliSense for DELETE method
const { execute: deleteItems } = useEnfyraApi('/items', {
  method: 'delete',
  errorContext: 'Delete Items'
});

await deleteItems({ ids: ['1', '2', '3'] });

// Advanced batch operations with concurrency control  
// 🎯 TypeScript shows batch options (batchSize, concurrent, onProgress) for DELETE method
const { execute: deleteMany } = useEnfyraApi('/users', {
  method: 'delete',
  batchSize: 10,      // ✅ Available: DELETE method supports batching
  concurrent: 3,      // ✅ Available: DELETE method supports batching  
  onProgress: (progress) => {  // ✅ Available: DELETE method supports batching
    console.log(`Deleting: ${progress.completed}/${progress.total}`);
  },
  onError: (error, context) => toast.error(`${context}: ${error.message}`)
});

// GET method example - batch options NOT available
// 🎯 TypeScript won't show batch options for GET method
const { execute: getUsers } = useEnfyraApi('/users', {
  method: 'get',
  // batchSize: 10,      // ❌ Not available: GET doesn't support batching
  // concurrent: 3,      // ❌ Not available: GET doesn't support batching
  // onProgress: () => {}  // ❌ Not available: GET doesn't support batching
  errorContext: 'Fetch Users'
});

// Delete 100 users in controlled batches
await deleteMany({ ids: Array.from({length: 100}, (_, i) => `user-${i}`) });

// Override batch settings per execution
// 🎯 TypeScript shows batch options for PATCH method
const { execute: updateUsers } = useEnfyraApi('/users', {
  method: 'patch',
  batchSize: 20,     // ✅ Available: PATCH method supports batching
  concurrent: 5      // ✅ Available: PATCH method supports batching
});

// This execution uses different settings
// 🎯 Batch options in execute() only available when using `ids` or `files`
await updateUsers({ 
  ids: largeUserList,           // ✅ Triggers batch mode
  body: { status: 'active' },
  batchSize: 50,     // ✅ Available: Using `ids` parameter  
  concurrent: 10,    // ✅ Available: Using `ids` parameter
  onProgress: (progress) => {   // ✅ Available: Using `ids` parameter
    console.log(`Updating: ${progress.completed}/${progress.total}`);
  }
});

// Single operation - batch options NOT available in execute
await updateUsers({
  id: 'single-user-id',         // ❌ Single operation, no batch options
  body: { status: 'active' }
  // batchSize: 50,             // ❌ Not available: Not using `ids` or `files`
  // concurrent: 10,            // ❌ Not available: Not using `ids` or `files`  
  // onProgress: () => {}       // ❌ Not available: Not using `ids` or `files`
});

// Batch file upload with real-time progress tracking
const progressState = ref({
  progress: 0,
  completed: 0,
  total: 0,
  failed: 0,
  estimatedTimeRemaining: 0,
  operationsPerSecond: 0
});

// 🎯 TypeScript shows batch options for POST method (supports file uploads)
const { execute: uploadFiles } = useEnfyraApi('/file_definition', {
  method: 'post',
  batchSize: 5,      // ✅ Available: POST method supports batching for files
  concurrent: 2,     // ✅ Available: POST method supports batching for files
  errorContext: 'Upload Files',
  onProgress: (progress) => {  // ✅ Available: POST method supports batching
    progressState.value = progress;
    console.log(`Progress: ${progress.progress}% (${progress.completed}/${progress.total})`);
    console.log(`ETA: ${Math.round((progress.estimatedTimeRemaining || 0) / 1000)}s`);
    console.log(`Speed: ${progress.operationsPerSecond?.toFixed(1)} ops/sec`);
  }
});

// Convert files to FormData array (matches enfyra_app pattern)
const formDataArray = selectedFiles.map(file => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folderId || 'null');
  return formData;
});

await uploadFiles({ 
  files: formDataArray // Array of FormData objects
});

// Real-time progress tracking with detailed results
const { execute: processData } = useEnfyraApi('/process', {
  method: 'post',
  batchSize: 10,
  concurrent: 3,
  onProgress: (progress) => {
    // Display progress bar
    updateProgressBar(progress.progress);
    
    // Show detailed metrics
    console.log('Batch Progress:', {
      percentage: progress.progress,
      completed: progress.completed,
      total: progress.total,
      failed: progress.failed,
      currentBatch: progress.currentBatch,
      totalBatches: progress.totalBatches,
      averageTime: progress.averageTime,
      estimatedTimeRemaining: progress.estimatedTimeRemaining,
      operationsPerSecond: progress.operationsPerSecond
    });
    
    // Handle individual results
    progress.results.forEach(result => {
      if (result.status === 'failed') {
        console.error(`Item ${result.index} failed:`, result.error);
      }
    });
  }
});

await processData({ 
  ids: largeDataSet,
  body: processingOptions 
});
```

### Real-time Progress Interface

```typescript
interface BatchProgress {
  progress: number;                    // 0-100 percentage
  completed: number;                   // Number of completed operations
  total: number;                       // Total number of operations
  failed: number;                      // Number of failed operations
  inProgress: number;                  // Operations currently running
  estimatedTimeRemaining?: number;     // Milliseconds remaining
  averageTime?: number;                // Average time per operation (ms)
  currentBatch: number;               // Current batch being processed
  totalBatches: number;               // Total number of batches
  operationsPerSecond?: number;       // Processing speed
  results: Array<{                    // Detailed results
    index: number;
    status: 'completed' | 'failed';
    result?: any;
    error?: ApiError;
    duration?: number;
  }>;
}
```

### TypeScript Integration

```typescript
// Define your API response types
interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T[];
  meta: { totalCount: number };
}

// Use with full type safety
const { data } = useEnfyraApi<ApiResponse<User>>('/users', {
  ssr: true
});

// TypeScript knows data.value is ApiResponse<User> | null
const users = computed(() => data.value?.data || []);
```

### Reactive Parameters

```typescript
const searchQuery = ref('');
const page = ref(1);

// SSR mode with reactive query (executes immediately)
const { data, refresh } = useEnfyraApi('/users', {
  ssr: true,
  key: () => `users-${page.value}-${searchQuery.value}`, // Optional
  query: computed(() => ({
    search: searchQuery.value,
    page: page.value,
    limit: 10
  }))
});

// Watch for changes and refresh
watch([searchQuery, page], () => refresh());
```

## Documentation

For comprehensive guides and examples:

📚 **[useEnfyraApi Complete Guide](https://github.com/dothinh115/enfyra-sdk-nuxt/blob/main/docs/useEnfyraApi.md)** - Detailed documentation with examples, best practices, and troubleshooting

Key topics covered:
- SSR vs Client Mode comparison
- Authentication and headers forwarding  
- Batch operations and CRUD patterns
- Error handling best practices
- TypeScript integration
- Performance optimization
- Migration guides

## Configuration

### Module Options

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@enfyra/sdk-nuxt"],
  enfyraSDK: {
    // Required: Main API URL
    apiUrl: process.env.ENFYRA_API_URL || "http://localhost:1105",
    
    // Required: App URL for SSR requests  
    appUrl: process.env.ENFYRA_APP_URL || "http://localhost:3001",
  },
})
```

### Environment Variables

```bash
# .env
ENFYRA_API_URL=https://api.enfyra.com
ENFYRA_APP_URL=https://app.enfyra.com
```

## Best Practices

### 1. Choose the Right Mode

```typescript
// ✅ Use SSR for initial page data (runs immediately)
const { data } = useEnfyraApi('/dashboard', {
  ssr: true,
  key: 'dashboard' // Optional
});

// ✅ Use Client mode for user interactions (manual execution)
const { execute: saveData } = useEnfyraApi('/settings', {
  method: 'patch',
  errorContext: 'Save Settings'  
});
```

### 2. Proper Error Handling

```typescript
// ✅ Check error state (don't use try-catch)
async function handleSubmit() {
  await execute({ body: formData });
  
  if (error.value) {
    return; // Error already logged
  }
  
  // Success handling
  toast.success('Saved successfully');
}
```

### 3. Type Safety

```typescript
// ✅ Define interfaces for API responses
interface CreateUserResponse {
  data: User;
  message: string;
}

const { execute } = useEnfyraApi<CreateUserResponse>('/users', {
  method: 'post'
});
```

## Troubleshooting

### Common Issues

1. **Headers not forwarded in SSR** - Ensure `ssr: true` is set
2. **Batch operations not working** - Only available in Client mode  
3. **Data not reactive** - Use computed refs for reactive parameters
4. **TypeScript errors** - Check return type differences between modes

### Performance Tips

- Use SSR for initial data loading (better SEO, faster page loads)
- Use Client mode for user interactions (better UX)
- Implement proper cache keys to avoid over-caching
- Group related operations with batch APIs

## Development

### Testing

The SDK includes a comprehensive test suite using Vitest:

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

**Test Coverage:**
- ✅ **Extension naming utilities** - UUID generation and validation
- ✅ **Vue SFC validation** - Syntax and structure validation  
- ✅ **JS bundle validation** - Syntax and export validation
- ✅ **Extension processing** - Complete workflow testing
- ✅ **35 test cases** covering all edge cases and error handling

### Building

```bash
# Build the module
npm run build

# Development mode
npm run dev
```

## License

MIT

## Contributing

Pull requests are welcome! Please read our contributing guidelines and ensure tests pass before submitting.

## Changelog

See [CHANGELOG.md](https://github.com/dothinh115/enfyra-sdk-nuxt/blob/main/CHANGELOG.md) for a detailed history of changes and migration guides.

## Support

For issues and questions:
- 📖 Check the [detailed documentation](https://github.com/dothinh115/enfyra-sdk-nuxt/blob/main/docs/useEnfyraApi.md)
- 🐛 [Report bugs](https://github.com/dothinh115/enfyra-sdk-nuxt/issues)
- 💬 [GitHub Discussions](https://github.com/dothinh115/enfyra-sdk-nuxt/discussions)