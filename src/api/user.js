import axiosInstance from "./axiosInstance";

/**
 * GET /users/me → UserResponse
 * { id, email, full_name?, avatar_url?, role, gender?, age?, weight?, height?,
 *   goal_weight?, step_goal, created_at, updated_at? }
 */
export async function getUser() {
  const res = await axiosInstance.get("/users/me");
  return res.data;
}

/**
 * PUT /users/me — body: UserUpdate (partial profile fields, not email/password)
 */
export async function updateUser(data) {
  const res = await axiosInstance.put("/users/me", data);
  return res.data;
}

/** PATCH /users/me/step-goal — body: { step_goal: number } */
export async function updateStepGoal(step_goal) {
  const res = await axiosInstance.patch("/users/me/step-goal", { step_goal });
  return res.data;
}

/** POST /users/me/avatar — multipart field `file` */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("/users/me/avatar", formData);
  return res.data;
}

/** GET /users/me/streak → { current_streak, longest_streak, last_logged_date?, streak_days } */
export async function getStreak() {
  const res = await axiosInstance.get("/users/me/streak");
  return res.data;
}

/**
 * GET /users/me/net-calories?date=YYYY-MM-DD
 * → { date, calories_eaten, calories_burned_manual, calories_burned_steps,
 *     calories_burned_total, net_calories }
 */
export async function getNetCalories(date) {
  const res = await axiosInstance.get("/users/me/net-calories", {
    params: date ? { date } : undefined,
  });
  return res.data;
}
