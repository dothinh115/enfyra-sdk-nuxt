const fs = require('fs');
const path = require('path');

// Copy composables function signatures to proper locations
const useEnfyraAuthTypes = `import type { LoginPayload, User } from "../types/auth";
import type { Ref, ComputedRef } from 'vue';
export declare function useEnfyraAuth(): {
    me: Ref<User | null>;
    login: (payload: LoginPayload) => Promise<any>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    isLoggedIn: ComputedRef<boolean>;
};`;

const useEnfyraApiTypes = `import type { ApiOptions, UseEnfyraApiReturn } from "../types";
export declare function useEnfyraApi<T = any>(path: (() => string) | string, opts?: ApiOptions<T>): UseEnfyraApiReturn<T>;`;

// Write to composables directory
fs.writeFileSync(path.join(__dirname, '../dist/composables/useEnfyraAuth.d.ts'), useEnfyraAuthTypes);
fs.writeFileSync(path.join(__dirname, '../dist/composables/useEnfyraApi.d.ts'), useEnfyraApiTypes);

console.log('✅ Fixed composables types');