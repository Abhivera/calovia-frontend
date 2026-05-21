const KEY = "calovia_settings";

const DEFAULTS = {
  dailyMealReminder: true,
  stepGoalReached: true,
  streakAlerts: true,
  weeklySummary: false,
  appleHealth: true,
  googleHealth: false,
  syncFrequency: "6h",
  calorieGoal: 2500,
  units: "metric",
  showExerciseRec: true,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
