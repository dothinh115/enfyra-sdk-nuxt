export default defineNuxtConfig({
  modules: ["../dist/module.mjs"],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      enfyraSDK: {
        apiUrl: "http://localhost:1105",
        appUrl: "http://localhost:3001",
        apiPrefix: "/api",
      },
    },
  },
});
