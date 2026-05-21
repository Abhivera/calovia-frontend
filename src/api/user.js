import axiosInstance from "./axiosInstance";

export async function getUser() {
  const res = await axiosInstance.get("/users/me");
  return res.data;
}

export async function updateUser(data) {
  const res = await axiosInstance.put("/users/me", data);
  return res.data;
}

/** @param {number} step_goal 1000–100000 */
export async function updateStepGoal(step_goal) {
  const res = await axiosInstance.patch("/users/me/step-goal", { step_goal });
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("/users/me/avatar", formData);
  return res.data;
}

/** @param {string} [date] YYYY-MM-DD */
export async function getStreak() {
  const res = await axiosInstance.get("/users/me/streak");
  return res.data;
}

/** @param {string} [date] YYYY-MM-DD */
export async function getNetCalories(date) {
  const res = await axiosInstance.get("/users/me/net-calories", {
    params: date ? { date } : undefined,
  });
  return res.data;
}
