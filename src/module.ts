import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addImportsDir,
} from "@nuxt/kit";

export default defineNuxtModule({
  meta: {
    name: "@enfyra/sdk-nuxt",
    configKey: "enfyraSDK",
  },
  defaults: {
    apiUrl: "",
    apiPrefix: "/api",
    appUrl: "",
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Validate required configuration
    if (!options.apiUrl || !options.appUrl) {
      throw new Error(
        `[Enfyra SDK Nuxt] Missing required configuration:\n` +
        `${!options.apiUrl ? '- apiUrl is required\n' : ''}` +
        `${!options.appUrl ? '- appUrl is required\n' : ''}` +
        `Please configure both in your nuxt.config.ts:\n` +
        `enfyraSDK: {\n` +
        `  apiUrl: 'https://your-api-url',\n` +
        `  appUrl: 'https://your-app-url'\n` +
        `}`
      );
    }

    // Make module options available at runtime
    nuxt.options.runtimeConfig.public.enfyraSDK = {
      ...nuxt.options.runtimeConfig.public.enfyraSDK,
      ...options,
    };

    // Auto-import composables
    addImportsDir(resolve("./composables"));

    // Register auth middleware to inject token
    addServerHandler({
      handler: resolve("./runtime/server/middleware/auth"),
      middleware: true,
    });

    // Register server handlers from SDK
    addServerHandler({
      route: "/api/login",
      handler: resolve("./runtime/server/api/login.post"),
      method: "post",
    });

    addServerHandler({
      route: "/api/logout",
      handler: resolve("./runtime/server/api/logout.post"),
      method: "post",
    });

    addServerHandler({
      route: "/api/**",
      handler: resolve("./runtime/server/api/all"),
    });
  },
});
