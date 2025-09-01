<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Authentication Test</h1>
        <p class="text-gray-600">Test Enfyra authentication features</p>
      </div>

      <div class="p-6">
        <!-- Auth Status -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Authentication Status
          </h2>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-500">Status:</span>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  isLoggedIn
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ isLoggedIn ? "Authenticated" : "Not Authenticated" }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between" v-if="me">
              <span class="text-sm font-medium text-gray-500">User:</span>
              <span class="text-sm text-gray-900">{{
                me.email || me.username || "N/A"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Login Form -->
        <div class="mb-8" v-if="!isLoggedIn">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Login</h2>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Email</label
              >
              <input
                id="email"
                v-model="loginForm.email"
                type="email"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
                >Password</label
              >
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ isLoading ? "Signing in..." : "Sign in" }}
            </button>
          </form>
        </div>

        <!-- SSR Test -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            SSR Test - Server-side /me fetch
          </h2>
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-500">SSR Status:</span>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  ssrPending
                    ? 'bg-yellow-100 text-yellow-800'
                    : ssrData
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ ssrPending ? "Loading..." : ssrData ? "Success" : "Failed" }}
              </span>
            </div>
            <pre class="text-sm text-gray-800">{{
              ssrError ? `Error: ${ssrError}` : JSON.stringify(ssrData, null, 2)
            }}</pre>
          </div>
          <button
            @click="refreshSSR"
            :disabled="ssrPending"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ ssrPending ? "Fetching..." : "Refresh SSR /me" }}
          </button>
        </div>

        <!-- User Info & Logout -->
        <div class="mb-8" v-if="isLoggedIn">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            User Information (Client)
          </h2>
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <pre class="text-sm text-gray-800">{{
              JSON.stringify(me, null, 2)
            }}</pre>
          </div>
          <button
            @click="handleLogout"
            :disabled="isLoading"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {{ isLoading ? "Signing out..." : "Sign out" }}
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mb-8">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <div class="mt-2 text-sm text-red-700">{{ error }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEnfyraAuth, useEnfyraApi } from "#imports";

const { login, logout, me, isLoggedIn } = useEnfyraAuth();

// SSR test - fetch /me from server
const { data: ssrData, error: ssrError, pending: ssrPending, refresh: refreshSSR } = useEnfyraApi('/me', {
  ssr: true,
  key: 'ssr-me-test'
});

const isLoading = ref(false);
const error = ref("");

const loginForm = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    await login({
      email: loginForm.email,
      password: loginForm.password,
    });

    // Clear form on success
    loginForm.email = "";
    loginForm.password = "";
  } catch (err) {
    error.value = err.message || "Login failed";
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    await logout();
  } catch (err) {
    error.value = err.message || "Logout failed";
  } finally {
    isLoading.value = false;
  }
};
</script>
