import AsyncStorage from "@react-native-async-storage/async-storage";

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

export type AppSettings = typeof DEFAULTS;

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings();
  const next = { ...current, ...partial };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
