import axiosInstance from "./axiosInstance";

/** @param {{ date?: string, week?: string, month?: string }} params */
export async function getMealSummary(params = {}) {
  const res = await axiosInstance.get("/meal/", { params });
  return res.data;
}

/** Today's meals (UTC date). */
export async function getTodayMealSummary() {
  const date = new Date().toISOString().split("T")[0];
  return getMealSummary({ date });
}
