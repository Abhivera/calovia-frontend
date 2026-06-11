import axiosInstance from "./axiosInstance";

export async function getMealSummary(params: Record<string, string | undefined> = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ) as Record<string, string>;
  const res = await axiosInstance.get("/meal/", { params: filtered });
  return res.data;
}

export async function getTodayMealSummary() {
  const date = new Date().toISOString().split("T")[0];
  return getMealSummary({ date });
}
