import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addImportsDir,
} from "@nuxt/kit";
import { ENFYRA_API_PREFIX } from "./constants/config";

export default defineNuxtModule({
  meta: {
    name: "@enfyra/sdk-nuxt",
    configKey: "enfyraSDK",
  },
  defaults: {
    apiUrl: "",
    appUrl: "",
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Validate required configuration
    if (!options.apiUrl || !options.appUrl) {
      throw new Error(
        `[Enfyra SDK Nuxt] Missing required configuration:\n` +
          `${!options.apiUrl ? "- apiUrl is required\n" : ""}` +
          `${!options.appUrl ? "- appUrl is required\n" : ""}` +
          `Please configure both in your nuxt.config.ts:\n` +
          `enfyraSDK: {\n` +
          `  apiUrl: 'https://your-api-url',\n` +
          `  appUrl: 'https://your-app-url'\n` +
          `}`
      );
    }

    // Make module options available at runtime with hardcoded apiPrefix
    nuxt.options.runtimeConfig.public.enfyraSDK = {
      ...options,
      apiPrefix: ENFYRA_API_PREFIX,
    };

    // Auto-import composables
    addImportsDir(resolve("./composables"));

    // Register auth middleware to inject token
    addServerHandler({
      handler: resolve("./runtime/server/middleware/auth"),
      middleware: true,
    });

    // Register server handlers from SDK with hardcoded prefix
    addServerHandler({
      route: `${ENFYRA_API_PREFIX}/login`,
      handler: resolve("./runtime/server/api/login.post"),
      method: "post",
    });

    addServerHandler({
      route: `${ENFYRA_API_PREFIX}/logout`,
      handler: resolve("./runtime/server/api/logout.post"),
      method: "post",
    });

    // Register extension_definition specific handlers
    addServerHandler({
      route: `${ENFYRA_API_PREFIX}/extension_definition`,
      handler: resolve("./runtime/server/api/extension_definition.post"),
      method: "post",
    });

    addServerHandler({
      route: `${ENFYRA_API_PREFIX}/extension_definition/**`,
      handler: resolve("./runtime/server/api/extension_definition/[id].patch"),
      method: "patch",
    });

    // Catch-all handler for other routes
    addServerHandler({
      route: `${ENFYRA_API_PREFIX}/**`,
      handler: resolve("./runtime/server/api/all"),
    });
  },
});
