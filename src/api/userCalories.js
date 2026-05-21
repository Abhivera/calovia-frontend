import axiosInstance from "./axiosInstance";

/**
 * @param {{ activity_type: string, duration_minutes: number, activity_date?: string }} data
 */
export async function logActivity(data) {
  const res = await axiosInstance.post("/user-calories/log-activity", data);
  return res.data;
}

export async function getCaloriesByDate(activity_date) {
  const res = await axiosInstance.get(`/user-calories/date/${activity_date}`);
  return res.data;
}

export async function createUserCalories(data) {
  const res = await axiosInstance.post("/user-calories/", data);
  return res.data;
}

export async function getUserCalories(params = {}) {
  const res = await axiosInstance.get("/user-calories/", { params });
  return res.data;
}

export async function updateUserCalories(caloriesId, data) {
  const res = await axiosInstance.put(`/user-calories/${caloriesId}`, data);
  return res.data;
}

export async function deleteUserCalories(caloriesId) {
  const res = await axiosInstance.delete(`/user-calories/${caloriesId}`);
  return res.data;
}

export async function getRecentCaloriesSummary(days = 7) {
  const res = await axiosInstance.get("/user-calories/summary/recent", {
    params: { days },
  });
  return res.data;
}
