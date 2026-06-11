import axiosInstance from "./axiosInstance";
import type { User } from "@/types/user";

export async function getUser(): Promise<User> {
  const res = await axiosInstance.get("/users/me");
  return res.data;
}

export async function updateUser(data: Partial<User>): Promise<User> {
  const res = await axiosInstance.put("/users/me", data);
  return res.data;
}

export async function updateStepGoal(step_goal: number): Promise<User> {
  const res = await axiosInstance.patch("/users/me/step-goal", { step_goal });
  return res.data;
}

export async function uploadAvatar(file: Blob | { uri: string; name: string; type: string }) {
  const formData = new FormData();
  formData.append("file", file as unknown as Blob);
  const res = await axiosInstance.post("/users/me/avatar", formData);
  return res.data;
}

export async function getStreak() {
  const res = await axiosInstance.get("/users/me/streak");
  return res.data;
}

export async function getNetCalories(date?: string) {
  const res = await axiosInstance.get("/users/me/net-calories", {
    params: date ? { date } : undefined,
  });
  return res.data;
}
