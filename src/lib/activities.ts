/** Activity keys match backend `ActivityType` enum. */
export const ACTIVITY_TYPES: Record<
  string,
  { name: string; met: number }
> = {
  walking: { name: "Walking", met: 3.5 },
  running: { name: "Running", met: 9.0 },
  cycling: { name: "Cycling", met: 6.0 },
  swimming: { name: "Swimming", met: 6.0 },
  yoga: { name: "Yoga", met: 2.5 },
  strength_training: { name: "Strength training", met: 5.0 },
};

export const ACTIVITY_PILLS = Object.keys(ACTIVITY_TYPES);

export function calculateActivityCalories(
  activityKey: string,
  minutes: number,
  bodyWeightKg = 70
) {
  const activity = ACTIVITY_TYPES[activityKey];
  if (!activity || !minutes || minutes <= 0) return 0;
  const weight = bodyWeightKg > 0 ? bodyWeightKg : 70;
  return Math.round(activity.met * weight * (minutes / 60));
}

export function getActivityDisplayName(activityKeyOrLabel: string) {
  if (ACTIVITY_TYPES[activityKeyOrLabel]) {
    return ACTIVITY_TYPES[activityKeyOrLabel].name;
  }
  const key = String(activityKeyOrLabel || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (ACTIVITY_TYPES[key]) return ACTIVITY_TYPES[key].name;
  return activityKeyOrLabel?.replace(/_/g, " ") || "Activity";
}

export function parseActivityDurationMinutes(activityName: string) {
  const match = String(activityName || "").match(/·\s*(\d+)\s*min/i);
  return match ? parseInt(match[1], 10) : null;
}
