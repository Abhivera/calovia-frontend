import axiosInstance from "./axiosInstance";

/** @param {{ start_date?: string, end_date?: string }} params */
export async function getStepsSummary(params = {}) {
  const res = await axiosInstance.get("/steps/summary", { params });
  return res.data;
}
