export function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return "0";
  return Number(n).toLocaleString();
}

export function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getUtcDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

/** ISO week for API `week` query param (e.g. 2026-W21). */
export function getUtcIsoWeekString(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Meal/image list filters aligned with Dietly API (`date` | `week` | `month`). */
export function mealPeriodParams(period) {
  const today = getUtcDateString();
  if (period === "today") return { date: today };
  if (period === "week") return { week: getUtcIsoWeekString() };
  return { month: today.slice(0, 7) };
}

/** UTC date strings for the last N calendar days (inclusive of today). */
export function utcDateRange(days) {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(getUtcDateString(d));
  }
  return dates;
}

export function getGreeting(name) {
  const hour = new Date().getHours();
  const period =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const first = name?.split(" ")?.[0] || "there";
  return `Good ${period}, ${first}`;
}

export function getInitials(name, email) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.[0] || "?").toUpperCase();
}
