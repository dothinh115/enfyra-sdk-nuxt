<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Enfyra SDK Playground
        </h1>
        <p class="text-lg text-gray-600 mb-8">
          Test your Enfyra SDK integration with Nuxt 3 and Tailwind CSS
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Authentication</h2>
            <p class="text-gray-600 mb-4">Test login, logout, and user management features</p>
            <NuxtLink 
              to="/auth"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Test Auth
            </NuxtLink>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">API Calls</h2>
            <p class="text-gray-600 mb-4">Test API endpoints and data fetching</p>
            <NuxtLink 
              to="/api"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Test API
            </NuxtLink>
          </div>
        </div>
        
        <div class="mt-8 bg-gray-100 rounded-lg p-4">
          <p class="text-sm text-gray-500">
            SDK Version: <span class="font-mono">{{ sdkVersion }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get SDK version from package.json
const sdkVersion = '0.1.10'
</script>