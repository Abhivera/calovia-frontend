import axiosInstance from "./axiosInstance";

/**
 * Link Firebase sign-in to a Calovia user (create or update on first sign-up).
 *
 * Request:  POST /auth/session
 * Headers:  Authorization: Bearer <firebase_id_token>
 * Body:     { "full_name"?: string }
 *
 * Response: UserResponse (same shape as GET /users/me)
 *
 * @param {{ full_name?: string }} [data]
 */
export async function syncSession(data = {}) {
  const res = await axiosInstance.post("/auth/session", data);
  return res.data;
}
