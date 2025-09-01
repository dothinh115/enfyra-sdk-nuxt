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

const useEnfyraApiTypes = `import type { ApiOptions, UseEnfyraApiSSRReturn, UseEnfyraApiClientReturn } from "../types";

// Function overloads for proper TypeScript support
export declare function useEnfyraApi<T = any>(
    path: (() => string) | string,
    opts: ApiOptions<T> & { ssr: true }
): UseEnfyraApiSSRReturn<T>;

export declare function useEnfyraApi<T = any>(
    path: (() => string) | string,  
    opts?: ApiOptions<T> & { ssr?: false | undefined }
): UseEnfyraApiClientReturn<T>;`;

// Main composables.d.ts content
const mainComposablesTypes = `import type { Ref, ComputedRef } from 'vue';
import type { LoginPayload, User, ApiOptions, UseEnfyraApiSSRReturn, UseEnfyraApiClientReturn } from './index';

export declare function useEnfyraAuth(): {
    me: Ref<User | null>;
    login: (payload: LoginPayload) => Promise<any>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    isLoggedIn: ComputedRef<boolean>;
};

// Function overloads for proper TypeScript support
export declare function useEnfyraApi<T = any>(
    path: (() => string) | string,
    opts: ApiOptions<T> & { ssr: true }
): UseEnfyraApiSSRReturn<T>;

export declare function useEnfyraApi<T = any>(
    path: (() => string) | string,
    opts?: ApiOptions<T> & { ssr?: false | undefined }
): UseEnfyraApiClientReturn<T>;`;

// Write to composables directory
fs.writeFileSync(path.join(__dirname, '../dist/composables/useEnfyraAuth.d.ts'), useEnfyraAuthTypes);
fs.writeFileSync(path.join(__dirname, '../dist/composables/useEnfyraApi.d.ts'), useEnfyraApiTypes);

// Write main composables.d.ts
fs.writeFileSync(path.join(__dirname, '../dist/composables.d.ts'), mainComposablesTypes);

console.log('✅ Fixed composables types');