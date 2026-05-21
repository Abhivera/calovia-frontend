import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/Layout/AppShell";
import PillButton from "@/components/ui/PillButton";
import {
  ACTIVITY_PILLS,
  calculateActivityCalories,
  getActivityDisplayName,
  parseActivityDurationMinutes,
} from "@/lib/activities";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { logActivity, getUserCalories } from "@/api/userCalories";
import { getUser } from "@/api/user";
import { formatLongDate, formatNumber, formatTime, getUtcDateString } from "@/lib/format";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function SummaryCard({ title, children }) {
  return (
    <div className="bg-[#f5f0e8] border border-[#ebe4d6] rounded-xl p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      {children}
    </div>
  );
}

function flattenActivities(entries, today) {
  const list = [];
  const arr = Array.isArray(entries) ? entries : [];
  for (const entry of arr) {
    for (const act of entry.calories_burned || []) {
      list.push({
        id: `${entry.id}-${act.activity_name}-${act.calories}`,
        entryId: entry.id,
        activity_date: entry.activity_date,
        activity_name: act.activity_name,
        calories: parseInt(act.calories, 10) || 0,
        duration_minutes:
          act.duration_minutes ??
          act.minutes ??
          parseActivityDurationMinutes(act.activity_name),
        created_at: entry.created_at,
      });
    }
  }
  return list.sort((a, b) => {
    if (a.activity_date === today && b.activity_date !== today) return -1;
    if (b.activity_date === today && a.activity_date !== today) return 1;
    return (b.activity_date || "").localeCompare(a.activity_date || "");
  });
}

export default function ActivityLog() {
  const today = getUtcDateString();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState([]);
  const [bodyWeight, setBodyWeight] = useState(70);
  const [showForm, setShowForm] = useState(false);
  const [activityType, setActivityType] = useState("running");
  const [duration, setDuration] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const weekAgo = new Date();
      weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
      const [user, data] = await Promise.all([
        getUser().catch(() => null),
        getUserCalories({
          start_date: weekAgo.toISOString().split("T")[0],
          end_date: today,
        }),
      ]);
      if (user?.weight) setBodyWeight(user.weight);
      setEntries(Array.isArray(data) ? data : data?.data || []);
    } catch {
      toast.error("Could not load activities");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const allActivities = useMemo(
    () => flattenActivities(entries, today),
    [entries, today]
  );

  const todayActivities = allActivities.filter((a) => a.activity_date === today);
  const weekActivities = allActivities.filter((a) => a.activity_date !== today);

  const totalBurnedToday = todayActivities.reduce((s, a) => s + a.calories, 0);
  const weeklyAvg = useMemo(() => {
    const byDay = {};
    allActivities.forEach((a) => {
      byDay[a.activity_date] = (byDay[a.activity_date] || 0) + a.calories;
    });
    const vals = Object.values(byDay);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  }, [allActivities]);

  const estimatedCalories = calculateActivityCalories(
    activityType,
    duration,
    bodyWeight
  );

  const handleSave = async () => {
    if (duration < 1 || duration > 480) {
      toast.error("Duration must be between 1 and 480 minutes");
      return;
    }
    setSaving(true);
    try {
      await logActivity({
        activity_type: activityType,
        duration_minutes: duration,
        activity_date: today,
      });
      toast.success("Activity saved");
      setShowForm(false);
      setDuration(30);
      setActivityType("running");
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const formatWeekDate = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity log</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatLongDate(new Date())}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 self-start bg-[#24a17b] hover:bg-[#1e8a6a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Log activity
          </button>
        </header>

        <div className="grid sm:grid-cols-3 gap-4">
          <SummaryCard title="Total burned today">
            <p className="text-3xl font-bold text-[#24a17b]">
              {loading ? "—" : formatNumber(totalBurnedToday)} kcal
            </p>
          </SummaryCard>
          <SummaryCard title="Activities today">
            <p className="text-3xl font-bold text-gray-900">
              {loading ? "—" : todayActivities.length}
            </p>
          </SummaryCard>
          <SummaryCard title="Weekly avg burn">
            <p className="text-3xl font-bold text-gray-900">
              {loading ? "—" : formatNumber(weeklyAvg)} kcal
            </p>
          </SummaryCard>
        </div>

        {showForm && (
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            <h2 className="font-semibold text-gray-900">Log activity</h2>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_PILLS.map((key) => (
                <PillButton
                  key={key}
                  active={activityType === key}
                  onClick={() => setActivityType(key)}
                >
                  {getActivityDisplayName(key)}
                </PillButton>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">{duration} min</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-[#24a17b] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 min</span>
                <span>120 min</span>
              </div>
            </div>
            <div className="rounded-lg bg-[#f0faf6] border border-[#c5e8dc] p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Estimated burn
              </p>
              <p className="text-3xl font-bold text-[#24a17b]">
                {formatNumber(estimatedCalories)} kcal
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-[#24a17b] hover:bg-[#1e8a6a] text-white text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save activity"}
              </button>
            </div>
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <h2 className="px-5 py-4 font-semibold text-gray-900 border-b border-gray-100">
            Today&apos;s activities
          </h2>
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#24a17b]" />
            </div>
          ) : todayActivities.length === 0 ? (
            <p className="p-6 text-sm text-gray-500 text-center">
              No activities logged today.
            </p>
          ) : (
            <ul>
              {todayActivities.map((act, idx) => (
                <li
                  key={act.id}
                  className={`flex items-center gap-3 px-5 py-4 ${
                    idx > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-[#e8f5f0] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-[#24a17b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {getActivityDisplayName(act.activity_name)}
                      {act.duration_minutes
                        ? ` · ${act.duration_minutes} min`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {act.created_at
                        ? `${formatTime(act.created_at)} · added manually`
                        : "added manually"}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatNumber(act.calories)} kcal
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {weekActivities.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <h2 className="px-5 py-4 font-semibold text-gray-900 border-b border-gray-100">
              This week
            </h2>
            <ul>
              {weekActivities.map((act, idx) => (
                <li
                  key={act.id}
                  className={`flex items-center gap-3 px-5 py-4 ${
                    idx > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-[#e8f5f0] flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-[#24a17b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {getActivityDisplayName(act.activity_name)}
                      {act.duration_minutes
                        ? ` · ${act.duration_minutes} min`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatWeekDate(act.activity_date)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatNumber(act.calories)} kcal
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
