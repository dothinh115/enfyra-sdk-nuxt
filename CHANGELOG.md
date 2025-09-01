# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2025-09-01

### Enhanced
- **🎯 TypeScript Function Overloads** - Added proper function overloads for better IntelliSense support
  - Separate return types for SSR mode (`UseEnfyraApiSSRReturn<T>`) and Client mode (`UseEnfyraApiClientReturn<T>`)
  - TypeScript now correctly infers `refresh` property in SSR mode and `execute` property in Client mode
  - Improved IDE autocomplete with accurate property suggestions based on mode

- **🚨 Enhanced Error Handling** - Redesigned error handling system with proper TypeScript support
  - Replaced complex `handleApiError` with simple `handleError` function
  - Added `ApiError` interface with consistent error structure (`message`, `status`, `data`, `response`)
  - Added `onError` callback option for custom error handling
  - Both SSR and Client modes now return `error: Ref<ApiError | null>` with full type safety
  - Default error handling uses `console.error` with structured error objects

- **🔧 Type System Cleanup** - Removed unnecessary legacy types
  - Removed `UseEnfyraApiReturn<T>` legacy type
  - Removed duplicate `src/types/composables.ts` file
  - Simplified type imports and exports for cleaner codebase

### Breaking Changes
- **Error Handling API Change** - The `errorContext` option behavior remains the same, but now works with the new `onError` callback system
  ```typescript
  // Before: Only console logging with complex parsing
  const { execute } = useEnfyraApi('/users', {
    errorContext: 'Create User'
  });

  // After: Custom error handling with typed error object
  const { execute } = useEnfyraApi('/users', {
    errorContext: 'Create User',
    onError: (error: ApiError, context?: string) => {
      toast.error(`${context}: ${error.message}`);
      // error.status, error.data, error.response are available
    }
  });
  ```

### Developer Experience
- **🎨 Better IntelliSense** - Function overloads ensure correct property suggestions
  - SSR mode: Shows `data`, `pending`, `error`, `refresh` (no `execute`)
  - Client mode: Shows `data`, `pending`, `error`, `execute` (no `refresh`)
  - Error objects have full autocomplete with `message`, `status`, `data`, `response` properties

- **📝 Updated Documentation** - Enhanced README with proper type differences explanation
  - Clear distinction between SSR and Client mode return types
  - Added warning sections highlighting the behavioral differences
  - Updated examples to show proper TypeScript usage patterns

## [0.2.0] - 2025-09-01

### Added
- **🎉 Authentication System** - Complete authentication composable with reactive state management
  - `useEnfyraAuth()` composable with login, logout, and user state management
  - Automatic JWT token handling with cookie storage
  - Server-side authentication middleware for protected routes
  - User state persistence across page reloads
  - Computed `isLoggedIn` reactive property
  - Built-in user data fetching and refresh capabilities

- **🔐 Server-Side Authentication Support**
  - Automatic authentication middleware for Nuxt server routes
  - JWT token validation on server-side requests
  - Protected API endpoints with automatic auth checks
  - Cookie-based session management

- **📝 Comprehensive Documentation**
  - Complete `useEnfyraApi` guide with SSR vs Client mode comparison
  - Authentication flow documentation with examples
  - Best practices guide for both composables
  - TypeScript integration examples
  - Troubleshooting and migration guides

### Enhanced
- **🚀 SSR Headers Forwarding** - Automatic authentication header forwarding in SSR mode
  - Forward `authorization`, `cookie`, `user-agent`, and other important headers
  - Clean connection-specific headers filtering
  - Seamless authentication across server and client

- **🎯 TypeScript Support** - Complete type definitions and auto-generation
  - Full type safety for all composables and interfaces  
  - Auto-generated TypeScript declarations on build
  - Proper export structure for IDE autocomplete
  - Interface definitions for API responses and auth types

- **📚 Enhanced Documentation Structure**
  - Updated README with comprehensive examples and guides
  - Detailed composable documentation with real-world examples
  - Configuration guide with environment variables
  - Performance optimization tips

### Technical Improvements
- **🔧 Build System Enhancement**
  - Fixed TypeScript declarations generation
  - Proper composables type exports for IDE support
  - Clean build process with automated type generation
  - Optimized package structure for better tree-shaking

### Breaking Changes
- None - Fully backward compatible with 0.1.x versions

## [0.1.13] - 2025-09-01

### Fixed
- **🔧 TypeScript Build System** - Fixed TypeScript configuration for proper type generation
- **📦 Package Structure** - Improved build output with correct type declarations
- **🎯 Composables Types** - Added proper TypeScript definitions for better IDE support

## [0.1.12] - 2025-09-01

### Fixed
- **⏰ Token Expiration Check** - Fixed token expiration interpretation to correctly handle milliseconds
- **🔄 Refresh Token Logic** - Improved token refresh mechanism with proper expiration validation

## [0.1.11] - 2025-09-01

### Enhanced
- **🔧 SSR Mode Support** - Enhanced server-side rendering capabilities
- **📊 Error Handling** - Improved error management and logging
- **🎯 TypeScript Integration** - Better type safety and IDE support

## [0.1.10] - 2025-09-01

### Added
- **📝 Batch Operations Documentation** - Added comprehensive examples for bulk operations
- **🎯 Dynamic Parameters** - Enhanced support for reactive URL parameters

### Fixed
- **🐛 Batch Operation Edge Cases** - Fixed issues with empty arrays and error handling

## [0.1.9] - 2025-09-01

### Enhanced  
- **🚀 Performance Optimizations** - Improved composable efficiency and memory usage
- **📊 Error Context** - Better error messages with contextual information

## [0.1.8] - 2025-09-01

### Fixed
- **🔄 Reactive State Management** - Fixed issues with reactive data updates
- **📱 Client-Side Hydration** - Improved SSR to client-side state synchronization

## [0.1.7] - 2025-09-01  

### Added
- **📁 Batch File Upload** - Support for multiple file uploads in single operation
- **🔧 Request Configuration** - Enhanced request configuration options

## [0.1.6] - 2025-09-01

### Enhanced
- **🎯 Dynamic ID Support** - Added support for dynamic resource IDs in execute options
- **📝 Documentation** - Improved inline code documentation and examples

## [0.1.5] - 2025-09-01

### Added  
- **🔄 Batch Operations** - Support for batch PATCH and DELETE operations with multiple IDs
- **📊 Array Response Handling** - Proper handling of batch operation responses

## [0.1.4] - 2025-09-01

### Fixed
- **🌐 SSR Configuration** - Fixed server-side rendering configuration issues
- **🔧 Module Registration** - Improved Nuxt module registration and initialization

## [0.1.3] - 2025-09-01

### Enhanced
- **📡 HTTP Methods** - Added support for PUT method
- **🔧 Request Headers** - Improved custom headers handling

## [0.1.2] - 2025-09-01

### Fixed  
- **🔄 State Management** - Fixed reactive state updates and error handling
- **📱 Client-Side Issues** - Resolved client-side execution problems

## [0.1.1] - 2025-09-01

### Fixed
- **📦 Package Configuration** - Fixed package.json exports and module structure
- **🔧 Build Issues** - Resolved build process and distribution problems

## [0.1.0] - 2025-09-01

### Added
- **🎉 Initial Release** - Core `useEnfyraApi` composable with SSR and client-side support
- **🌐 SSR Support** - Server-side rendering with automatic `useFetch` integration
- **📱 Client Mode** - Manual execution control with `$fetch` for interactive operations  
- **🔧 HTTP Methods** - Support for GET, POST, PATCH, DELETE operations
- **📊 Reactive State** - Built-in loading, error, and data state management
- **🎯 TypeScript** - Full TypeScript support with type definitions
- **⚡ Cache Support** - Optional cache keys for SSR mode optimization
- **🔄 Dynamic URLs** - Support for reactive URL parameters with functions
- **📝 Query Parameters** - URL query parameter support with reactive refs
- **🎛️ Custom Headers** - Custom request headers support
- **🚨 Error Handling** - Automatic error handling with console logging
- **📚 Nuxt Integration** - Full Nuxt 3 module with auto-imports

---

## Version History Summary

- **0.1.x** - Core `useEnfyraApi` composable with SSR support, batch operations, and TypeScript integration
- **0.2.0** - Added complete authentication system with `useEnfyraAuth`, server-side auth middleware, and comprehensive documentation
- **0.2.1** - Enhanced TypeScript support with function overloads, improved error handling with typed errors, and better IntelliSense

## Migration Guide

### From 0.1.x to 0.2.x

No breaking changes - all 0.1.x functionality remains the same. New authentication features are additive:

```typescript
// 0.1.x - Still works exactly the same
const { data, execute } = useEnfyraApi('/users');

// 0.2.x - New authentication features  
const { login, logout, me, isLoggedIn } = useEnfyraAuth();
```

### New in 0.2.x

1. **Add authentication to your app:**
```typescript
// Login user
await login({ email: 'user@example.com', password: 'password' });

// Check auth status
if (isLoggedIn.value) {
  console.log('Current user:', me.value);
}

// Logout
await logout();
```

2. **Automatic SSR authentication:**
```typescript
// Headers automatically forwarded in SSR mode
const { data: profile } = useEnfyraApi('/me', {
  ssr: true,
  key: 'user-profile'
});
```

3. **Enhanced documentation:**
- Complete guides for both composables
- Real-world examples and best practices  
- TypeScript integration patterns
- Performance optimization tips