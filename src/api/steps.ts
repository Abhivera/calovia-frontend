import axiosInstance from "./axiosInstance";

export async function getStepsSummary(params: Record<string, string> = {}) {
  const res = await axiosInstance.get("/steps/summary", { params });
  return res.data;
}
