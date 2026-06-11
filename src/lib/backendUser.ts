import type { AxiosError } from "axios";
import * as authApi from "@/api/auth";
import * as userApi from "@/api/user";
import type { User } from "@/types/user";

function isUnregisteredAccount(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string }>;
  if (axiosError?.response?.status !== 401) return false;
  const detail = axiosError.response?.data?.detail;
  return typeof detail === "string" && detail.includes("Account not found");
}

export function sessionPayloadFromFirebaseUser(firebaseUser: {
  displayName?: string | null;
}) {
  const name = firebaseUser?.displayName?.trim();
  return name ? { full_name: name } : {};
}

export async function resolveBackendUser(
  sessionPayload?: { full_name?: string }
): Promise<User> {
  try {
    return await userApi.getUser();
  } catch (e) {
    if (isUnregisteredAccount(e)) {
      return authApi.syncSession(sessionPayload ?? {});
    }
    throw e;
  }
}
