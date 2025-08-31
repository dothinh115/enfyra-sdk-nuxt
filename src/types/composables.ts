import type { Ref, ComputedRef } from 'vue'
import type { LoginPayload, User, ApiOptions, UseEnfyraApiReturn } from './index'

export declare function useEnfyraAuth(): {
  me: Ref<User | null>
  login: (payload: LoginPayload) => Promise<any>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  isLoggedIn: ComputedRef<boolean>
}

export declare function useEnfyraApi<T = any>(
  path: (() => string) | string,
  opts?: ApiOptions<T>
): UseEnfyraApiReturn<T>