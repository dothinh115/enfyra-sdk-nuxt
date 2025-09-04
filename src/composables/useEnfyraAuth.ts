import { ref, computed } from "vue";
import type { LoginPayload, User } from "../types/auth";
import { useEnfyraApi } from "./useEnfyraApi";

const me = ref<User | null>(null);
const isLoading = ref<boolean>(false);

export function useEnfyraAuth() {
  const meFields = [
    "id",
    "email",
    "isRootAdmin",
    "isSystem",
    "role.id",
    "role.name",
    "role.routePermissions.id",
    "role.routePermissions.isEnabled",
    "role.routePermissions.allowedUsers",
    "role.routePermissions.methods.id",
    "role.routePermissions.methods.method",
    "role.routePermissions.route.id",
    "role.routePermissions.route.path",
    "allowedRoutePermissions.id",
    "allowedRoutePermissions.isEnabled",
    "allowedRoutePermissions.allowedUsers.id",
    "allowedRoutePermissions.methods.id",
    "allowedRoutePermissions.methods.method",
    "allowedRoutePermissions.route.id",
    "allowedRoutePermissions.route.path",
  ];

  const {
    data: meData,
    execute: executeFetchUser,
    error: fetchUserError,
  } = useEnfyraApi("/me", {
    query: {
      fields: meFields.join(","),
    },
    errorContext: "Fetch User Profile",
  });

  const { execute: executeLogin, error: loginError } = useEnfyraApi("/login", {
    method: "post",
    errorContext: "Login",
  });

  const { execute: executeLogout } = useEnfyraApi("/logout", {
    method: "post",
    errorContext: "Logout",
  });

  const fetchUser = async () => {
    isLoading.value = true;

    try {
      await executeFetchUser();

      if (fetchUserError.value) {
        me.value = null;
        return;
      }

      me.value = (meData.value as any)?.data?.[0] || meData.value || null;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (payload: LoginPayload) => {
    isLoading.value = true;

    try {
      const response = await executeLogin({ body: payload });

      if (loginError.value) {
        return null;
      }

      await fetchUser();
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;

    try {
      await executeLogout();
      me.value = null;

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      me.value = null;
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } finally {
      isLoading.value = false;
    }
  };

  const isLoggedIn = computed(() => !!me.value);
  return {
    me,
    login,
    logout,
    fetchUser,
    isLoggedIn,
  };
}
