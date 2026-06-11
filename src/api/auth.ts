import axiosInstance from "./axiosInstance";
import type { User } from "@/types/user";

export async function syncSession(data: { full_name?: string } = {}): Promise<User> {
  const res = await axiosInstance.post("/auth/session", data);
  return res.data;
}
