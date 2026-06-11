import axiosInstance from "./axiosInstance";

export async function logActivity(data: {
  activity_type: string;
  duration_minutes: number;
  activity_date?: string;
}) {
  const res = await axiosInstance.post("/user-calories/log-activity", data);
  return res.data;
}

export async function getUserCalories(params: Record<string, string> = {}) {
  const res = await axiosInstance.get("/user-calories/", { params });
  return res.data;
}
