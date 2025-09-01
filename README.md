# @enfyra/sdk-nuxt

Nuxt SDK for Enfyra CMS - A powerful composable-based API client with full SSR support and TypeScript integration.

## Features

✅ **SSR & Client-Side Support** - Automatic server-side rendering with `useFetch` or client-side with `$fetch`  
✅ **Authentication Integration** - Built-in auth composables with automatic header forwarding  
✅ **TypeScript Support** - Full type safety with auto-generated declarations  
✅ **Batch Operations** - Efficient bulk operations for CRUD actions (client-side)  
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
- `batchSize?: number` - Batch size for chunking large operations (default: no limit)
- `concurrent?: number` - Maximum concurrent requests (default: no limit)
- `key?: string` - Cache key (SSR mode, optional)
- `default?: () => T` - Default value (SSR mode only)

**⚠️ Important: Return Types Differ**
- **SSR Mode**: Returns `useFetch` result `{ data, pending, error, refresh }`
- **Client Mode**: Returns custom result `{ data, pending, error, execute }`

**Execute Options (Client mode only):**
- `id?: string | number` - Single resource ID
- `ids?: (string | number)[]` - Batch operation IDs (PATCH/DELETE)
- `files?: FormData[]` - Array of FormData objects for batch upload (POST)
- `body?: any` - Override request body
- `batchSize?: number` - Override batch size for this execution
- `concurrent?: number` - Override concurrent limit for this execution

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
const { execute: deleteItems } = useEnfyraApi('/items', {
  method: 'delete',
  errorContext: 'Delete Items'
});

await deleteItems({ ids: ['1', '2', '3'] });

// Advanced batch operations with concurrency control
const { execute: deleteMany } = useEnfyraApi('/users', {
  method: 'delete',
  batchSize: 10,      // Process 10 items at a time
  concurrent: 3,      // Max 3 requests simultaneously
  onError: (error, context) => toast.error(`${context}: ${error.message}`)
});

// Delete 100 users in controlled batches
await deleteMany({ ids: Array.from({length: 100}, (_, i) => `user-${i}`) });

// Override batch settings per execution
const { execute: updateUsers } = useEnfyraApi('/users', {
  method: 'patch',
  batchSize: 20,     // Default: 20 per batch
  concurrent: 5      // Default: 5 concurrent
});

// This execution uses different settings
await updateUsers({ 
  ids: largeUserList,
  body: { status: 'active' },
  batchSize: 50,     // Override: 50 per batch for this call
  concurrent: 10     // Override: 10 concurrent for this call
});

// Batch file upload with progress control
const { execute: uploadFiles } = useEnfyraApi('/file_definition', {
  method: 'post',
  batchSize: 5,      // Upload 5 files at a time
  concurrent: 2,     // Max 2 uploads simultaneously
  errorContext: 'Upload Files'
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
    
    // Optional: API path prefix (default: '')
    apiPrefix: '/api/v1',
    
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

## License

MIT

## Contributing

Pull requests are welcome! Please read our contributing guidelines and ensure tests pass.

## Changelog

See [CHANGELOG.md](https://github.com/dothinh115/enfyra-sdk-nuxt/blob/main/CHANGELOG.md) for a detailed history of changes and migration guides.

## Support

For issues and questions:
- 📖 Check the [detailed documentation](https://github.com/dothinh115/enfyra-sdk-nuxt/blob/main/docs/useEnfyraApi.md)
- 🐛 [Report bugs](https://github.com/dothinh115/enfyra-sdk-nuxt/issues)
- 💬 [GitHub Discussions](https://github.com/dothinh115/enfyra-sdk-nuxt/discussions)