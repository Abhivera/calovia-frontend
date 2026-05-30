import * as authApi from "@/api/auth";
import * as userApi from "@/api/user";

/** @param {import('axios').AxiosError} error */
function isUnregisteredAccount(error) {
  if (error?.response?.status !== 401) return false;
  const detail = error.response?.data?.detail;
  return (
    typeof detail === "string" &&
    detail.includes("Account not found")
  );
}

/** Build POST /auth/session payload from a Firebase user (Google display name, etc.). */
export function sessionPayloadFromFirebaseUser(firebaseUser) {
  const name = firebaseUser?.displayName?.trim();
  return name ? { full_name: name } : {};
}

/**
 * Load Calovia profile; create/link DB row on first Firebase sign-in.
 * @param {{ full_name?: string }} [sessionPayload]
 * @returns {Promise<object>}
 */
export async function resolveBackendUser(sessionPayload) {
  try {
    return await userApi.getUser();
  } catch (e) {
    if (isUnregisteredAccount(e)) {
      return authApi.syncSession(sessionPayload ?? {});
    }
    throw e;
  }
}
