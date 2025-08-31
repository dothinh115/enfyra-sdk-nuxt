<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">API Test</h1>
        <p class="text-gray-600">Test Enfyra API endpoints</p>
      </div>

      <div class="p-6">
        <!-- API Request Form -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Make API Request
          </h2>
          <form @submit.prevent="makeRequest" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="method"
                  class="block text-sm font-medium text-gray-700"
                  >Method</label
                >
                <select
                  id="method"
                  v-model="requestForm.method"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div>
                <label
                  for="endpoint"
                  class="block text-sm font-medium text-gray-700"
                  >Endpoint</label
                >
                <input
                  id="endpoint"
                  v-model="requestForm.endpoint"
                  type="text"
                  placeholder="/api/users"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div v-if="['POST', 'PUT'].includes(requestForm.method)">
              <label for="body" class="block text-sm font-medium text-gray-700"
                >Request Body (JSON)</label
              >
              <textarea
                id="body"
                v-model="requestForm.body"
                rows="4"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder='{"key": "value"}'
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !requestForm.endpoint"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ isLoading ? "Making Request..." : "Send Request" }}
            </button>
          </form>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              @click="quickRequest('GET', '/api/user')"
              class="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
            >
              Get User Profile
            </button>
            <button
              @click="quickRequest('GET', '/api/dashboard')"
              class="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
            >
              Get Dashboard
            </button>
            <button
              @click="quickRequest('GET', '/api/settings')"
              class="px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm hover:bg-purple-200"
            >
              Get Settings
            </button>
          </div>
        </div>

        <!-- Response Display -->
        <div v-if="response" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Response</h2>
          <div class="bg-gray-50 rounded-lg p-4 border">
            <div class="mb-2">
              <span class="text-sm font-medium text-gray-500">Status:</span>
              <span
                :class="[
                  'ml-2 px-2 py-1 rounded text-xs font-medium',
                  response.status < 400
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ response.status }} {{ response.statusText }}
              </span>
            </div>
            <div class="mb-2">
              <span class="text-sm font-medium text-gray-500"
                >Response Time:</span
              >
              <span class="ml-2 text-sm text-gray-900"
                >{{ responseTime }}ms</span
              >
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Data:</span>
              <pre class="mt-2 text-sm text-gray-800 overflow-auto max-h-96">{{
                JSON.stringify(response.data, null, 2)
              }}</pre>
            </div>
          </div>
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

<script setup>
// Create a simple API wrapper using useEnfyraApi
const apiCall = (endpoint, options = {}) => {
  const { execute } = useEnfyraApi(endpoint, options);
  return execute();
};

const isLoading = ref(false);
const error = ref("");
const response = ref(null);
const responseTime = ref(0);

const requestForm = reactive({
  method: "GET",
  endpoint: "",
  body: "",
});

const makeRequest = async () => {
  let startTime = Date.now();

  try {
    isLoading.value = true;
    error.value = "";
    response.value = null;

    startTime = Date.now();

    let requestData = undefined;
    if (["POST", "PUT"].includes(requestForm.method) && requestForm.body) {
      try {
        requestData = JSON.parse(requestForm.body);
      } catch (parseError) {
        throw new Error("Invalid JSON in request body");
      }
    }

    const result = await apiCall(requestForm.endpoint, {
      method: requestForm.method,
      body: requestData,
    });
    responseTime.value = Date.now() - startTime;
    response.value = {
      status: 200,
      statusText: "OK",
      data: result,
    };
  } catch (err) {
    responseTime.value = Date.now() - startTime;
    error.value = err.message || "Request failed";
    if (err.response) {
      response.value = {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data,
      };
    }
  } finally {
    isLoading.value = false;
  }
};

const quickRequest = async (method, endpoint) => {
  requestForm.method = method;
  requestForm.endpoint = endpoint;
  requestForm.body = "";
  await makeRequest();
};
</script>
