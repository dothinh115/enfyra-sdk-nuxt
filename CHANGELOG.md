# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-09-01

### 🔧 Enhanced Architecture & Testing - Production-Ready Development Experience

This release focuses on code quality, maintainability, and developer experience with modular architecture and comprehensive testing.

### Added
- **✅ Comprehensive Test Suite** - Production-ready quality assurance
  - **35 Test Cases** covering all core functionality and edge cases
  - **Vitest Framework** - Modern testing with UI support and watch mode
  - **Mock Integration** - Isolated unit testing for reliable CI/CD
  - **TypeScript Coverage** - Full type safety validation across the codebase

- **🏗️ Modular Architecture** - Clean, maintainable code structure
  - **Focused Modules** - Separated concerns for better maintainability
  - **Clean Exports** - Improved import structure and tree-shaking
  - **Performance Optimized** - Efficient processing with automatic cleanup
  - **Security Enhanced** - Input validation and error handling improvements

### Enhanced  
- **🛠️ Developer Experience** - Professional development workflow
  - **Test Scripts** - `npm test`, `npm run test:ui`, `npm run test:run`
  - **Build Optimization** - Faster builds with latest Vite 6.0.7
  - **TypeScript Integration** - Enhanced type safety and IntelliSense
  - **Documentation** - Updated README with testing instructions

- **📦 Package Updates** - Latest tools and dependencies
  - **Vite 6.0.7** - Latest build tool for optimal performance  
  - **@vitejs/plugin-vue 5.2.0** - Enhanced Vue processing capabilities
  - **Vitest 3.2.4** - Modern testing framework with excellent DX

### Technical Improvements
- **Background Processing** - Enhanced server-side handling for specialized operations
- **Automatic Cleanup** - Memory efficient processing with proper resource management  
- **Error Recovery** - Graceful handling of edge cases and failures
- **Concurrent Safety** - Thread-safe operations for production environments

### Breaking Changes
None - Fully backward compatible. All existing functionality remains unchanged.

## [0.2.3] - 2025-09-01

### 🚀 Real-time Progress Tracking - Revolutionary Batch Monitoring

This release introduces industry-first real-time progress tracking for batch operations, providing unparalleled visibility into bulk processing operations with comprehensive metrics and developer-friendly interfaces.

### Added
- **📊 Real-time Progress Callbacks** - Live batch operation monitoring with detailed metrics
  - `onProgress?: (progress: BatchProgress) => void` - Real-time callback with comprehensive progress data
  - Works with all batch operations (PATCH, DELETE, POST file uploads)
  - Available at both composable level and per-execution level with override support

- **🎯 Comprehensive BatchProgress Interface** - Industry-leading progress tracking with full TypeScript support
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

- **⏱️ Advanced Performance Metrics** - Professional-grade monitoring capabilities
  - **Real-time ETA calculation** - Estimated time remaining based on current processing speed
  - **Operations per second tracking** - Live processing speed monitoring
  - **Average processing time** - Individual operation performance metrics
  - **Batch progress visualization** - Current batch vs total batches tracking
  - **Individual result logging** - Success/failure status for each operation with duration

- **🎛️ Flexible Progress Configuration** - Complete control over progress monitoring
  ```typescript
  // Global progress tracking for all executions
  const { execute } = useEnfyraApi('/users', {
    method: 'delete',
    batchSize: 10,
    concurrent: 3,
    onProgress: (progress) => {
      updateProgressBar(progress.progress);
      console.log(`${progress.completed}/${progress.total} - ETA: ${progress.estimatedTimeRemaining}ms`);
    }
  });

  // Override progress tracking per execution
  await execute({
    ids: criticalUserIds,
    onProgress: (progress) => {
      // Custom progress handling for this specific operation
      sendProgressToAnalytics(progress);
    }
  });
  ```

- **🔒 Configuration Validation** - Enhanced module setup with required configuration validation
  - Automatic validation of required `apiUrl` and `appUrl` configuration
  - Clear error messages with setup instructions when configuration is missing
  - Prevents runtime errors with early configuration validation during Nuxt module setup

### Enhanced
- **⚡ Performance Optimization** - Zero-overhead progress tracking when not used
  - Progress calculations only execute when `onProgress` callback is provided
  - Minimal performance impact with efficient metric calculation
  - Smart memory management for large batch operations

- **🛠️ Developer Experience** - Complete TypeScript integration with comprehensive examples
  - Full IntelliSense support for BatchProgress interface
  - Detailed progress tracking examples in README
  - Real-world use cases for progress monitoring
  - Professional progress bar implementation examples

### Use Cases Unlocked
- **Enterprise Dashboards**: Real-time bulk operation monitoring with ETA displays
- **File Upload Systems**: Live upload progress with speed and completion metrics
- **Data Migration Tools**: Professional progress tracking for large dataset operations
- **Admin Panels**: User-friendly bulk operation feedback with detailed progress
- **CI/CD Systems**: Batch processing monitoring with performance analytics

### Breaking Changes
None - Fully backward compatible. All existing batch operations continue to work unchanged. Progress tracking is opt-in via `onProgress` callback.

## [0.2.2] - 2025-09-01

### 🚀 Enhanced Batch Operations - Game-Changing Performance Control

This release introduces advanced batch processing capabilities that set Enfyra SDK apart from other CMS SDKs with unprecedented control over bulk operations.

### Added
- **🎯 Advanced Batch Control** - Industry-leading batch processing with chunking and concurrency control
  - `batchSize?: number` - Control how many items to process per batch chunk (default: no limit)
  - `concurrent?: number` - Limit maximum simultaneous requests (default: no limit) 
  - Both options work for PATCH, DELETE, and POST (file upload) batch operations
  - Per-execution overrides available through `execute()` parameters

- **💡 Intelligent Chunking Algorithm** - Smart batch processing that optimizes for both performance and resource usage
  ```typescript
  // Process 1000 users: 20 per batch, max 5 concurrent requests
  await execute({ 
    ids: thousandUserIds,
    batchSize: 20,
    concurrent: 5
  });
  ```

- **🎛️ Fine-Grained Control** - Override batch settings per individual execution
  ```typescript
  // Default settings for composable
  const { execute } = useEnfyraApi('/users', {
    batchSize: 10,
    concurrent: 3
  });

  // Override for specific execution
  await execute({
    ids: criticalUserIds,
    batchSize: 50,    // Override: bigger batches
    concurrent: 10    // Override: more concurrent requests
  });
  ```

- **📊 ExecuteOptions Interface** - New TypeScript interface with full type safety
  - All execute options now properly typed with IntelliSense support
  - Includes both original options (body, id, ids, files) and new batch controls

### Enhanced
- **⚡ Performance Optimization** - Batch operations now scale from small datasets to enterprise-level bulk operations
  - **Memory efficient**: Chunking prevents memory overload with large datasets
  - **Server friendly**: Concurrency limits prevent overwhelming backend servers
  - **Flexible scaling**: From unlimited parallel (current behavior) to highly controlled batching

- **🛠️ Developer Experience** - Complete TypeScript support with detailed documentation
  - Full IntelliSense for all batch parameters
  - Comprehensive examples covering all use cases
  - Clear documentation of performance implications

### Use Cases Unlocked
- **Enterprise Admin Panels**: Bulk user management with controlled server load
- **Large-Scale Content Operations**: Mass content publishing with memory efficiency  
- **File Upload Systems**: Controlled parallel uploads with progress monitoring
- **Data Migration Tools**: Chunked processing for large dataset transformations


### Breaking Changes
None - Fully backward compatible. All existing batch operations continue to work unchanged (unlimited parallelism by default).

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
- **0.2.2** - Revolutionary batch processing with chunking and concurrency control - industry-leading bulk operations
- **0.2.3** - Real-time progress tracking for batch operations with comprehensive metrics and configuration validation
- **0.3.0** - Extension definition processing with Vue SFC compilation, modular architecture, and comprehensive test suite

## Migration Guide

### From 0.2.x to 0.3.x

No breaking changes - all 0.2.x functionality remains the same. Extension definition processing is handled automatically:

```typescript
// All existing code works unchanged
const { data, execute } = useEnfyraApi('/users');
const { login, logout, me } = useEnfyraAuth();

// Extension definition processing is automatic - no code changes needed
const { execute: createExtension } = useEnfyraApi('/extension_definition', {
  method: 'post'
});

await createExtension({
  body: {
    name: 'My Extension',
    code: '<template><div>Vue SFC</div></template>' // Automatically compiled
  }
});
```

### New in 0.3.x

1. **Enhanced development experience:**
- Comprehensive test suite with 35 test cases
- Modular architecture for maintainability
- Latest Vite 6.0.7 and Vue tools
- Background processing improvements

2. **Testing capabilities:**
```bash
# Run tests
npm test

# Run tests with UI  
npm run test:ui

# Run tests once
npm run test:run
```

### From 0.1.x to 0.2.x

No breaking changes - all 0.1.x functionality remains the same. New authentication features are additive:

```typescript
// 0.1.x - Still works exactly the same
const { data, execute } = useEnfyraApi('/users');

// 0.2.x - New authentication features  
const { login, logout, me, isLoggedIn } = useEnfyraAuth();
```