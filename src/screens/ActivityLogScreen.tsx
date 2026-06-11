import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Activity } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AppShell from "@/components/layout/AppShell";
import PillButton from "@/components/ui/PillButton";
import { Card, PrimaryButton, SecondaryButton } from "@/components/ui/Common";
import { getUser } from "@/api/user";
import { getUserCalories, logActivity } from "@/api/userCalories";
import {
  ACTIVITY_PILLS,
  calculateActivityCalories,
  getActivityDisplayName,
  parseActivityDurationMinutes,
} from "@/lib/activities";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { formatLongDate, formatNumber, formatTime, getUtcDateString } from "@/lib/format";
import { colors } from "@/theme/colors";

type ActivityEntry = {
  id: string;
  entryId: string;
  activity_date: string;
  activity_name: string;
  calories: number;
  duration_minutes?: number;
  created_at?: string;
};

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 140,
        backgroundColor: colors.summaryBg,
        borderWidth: 1,
        borderColor: colors.summaryBorder,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>{title}</Text>
      {children}
    </View>
  );
}

function flattenActivities(entries: unknown[], today: string): ActivityEntry[] {
  const list: ActivityEntry[] = [];
  const arr = Array.isArray(entries) ? entries : [];
  for (const entry of arr as {
    id: string;
    activity_date: string;
    created_at?: string;
    calories_burned?: {
      activity_name: string;
      calories: string | number;
      duration_minutes?: number;
      minutes?: number;
    }[];
  }[]) {
    for (const act of entry.calories_burned || []) {
      list.push({
        id: `${entry.id}-${act.activity_name}-${act.calories}`,
        entryId: entry.id,
        activity_date: entry.activity_date,
        activity_name: act.activity_name,
        calories: parseInt(String(act.calories), 10) || 0,
        duration_minutes:
          act.duration_minutes ??
          act.minutes ??
          parseActivityDurationMinutes(act.activity_name) ??
          undefined,
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

function formatWeekDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function ActivityRow({ act }: { act: ActivityEntry }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          backgroundColor: colors.mint,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Activity size={20} color={colors.brand} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", color: colors.text }}>
          {getActivityDisplayName(act.activity_name)}
          {act.duration_minutes ? ` · ${act.duration_minutes} min` : ""}
        </Text>
        {act.created_at ? (
          <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
            {formatTime(act.created_at)} · added manually
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>added manually</Text>
        )}
      </View>
      <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>
        {formatNumber(act.calories)} kcal
      </Text>
    </View>
  );
}

export default function ActivityLogScreen() {
  const today = getUtcDateString();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<unknown[]>([]);
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
      setEntries(Array.isArray(data) ? data : (data as { data?: unknown[] })?.data || []);
    } catch {
      Toast.show({ type: "error", text1: "Could not load activities" });
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const allActivities = useMemo(() => flattenActivities(entries, today), [entries, today]);
  const todayActivities = allActivities.filter((a) => a.activity_date === today);
  const weekActivities = allActivities.filter((a) => a.activity_date !== today);
  const totalBurnedToday = todayActivities.reduce((s, a) => s + a.calories, 0);

  const weeklyAvg = useMemo(() => {
    const byDay: Record<string, number> = {};
    allActivities.forEach((a) => {
      byDay[a.activity_date] = (byDay[a.activity_date] || 0) + a.calories;
    });
    const vals = Object.values(byDay);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  }, [allActivities]);

  const estimatedCalories = calculateActivityCalories(activityType, duration, bodyWeight);

  const adjustDuration = (delta: number) => {
    setDuration((d) => Math.min(120, Math.max(5, d + delta)));
  };

  const handleSave = async () => {
    if (duration < 1 || duration > 480) {
      Toast.show({ type: "error", text1: "Duration must be between 1 and 480 minutes" });
      return;
    }
    setSaving(true);
    try {
      await logActivity({
        activity_type: activityType,
        duration_minutes: duration,
        activity_date: today,
      });
      Toast.show({ type: "success", text1: "Activity saved" });
      setShowForm(false);
      setDuration(30);
      setActivityType("running");
      await load();
    } catch (err) {
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 896, alignSelf: "center", width: "100%", gap: 24 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Activity log</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              {formatLongDate(new Date())}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowForm(true)}
            style={{
              backgroundColor: colors.brand,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Log activity</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          <SummaryCard title="Total burned today">
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.brand }}>
              {loading ? "—" : `${formatNumber(totalBurnedToday)} kcal`}
            </Text>
          </SummaryCard>
          <SummaryCard title="Activities today">
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
              {loading ? "—" : todayActivities.length}
            </Text>
          </SummaryCard>
          <SummaryCard title="Weekly avg burn">
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
              {loading ? "—" : `${formatNumber(weeklyAvg)} kcal`}
            </Text>
          </SummaryCard>
        </View>

        {showForm ? (
          <Card style={{ gap: 20 }}>
            <Text style={{ fontWeight: "600", color: colors.text, fontSize: 16 }}>Log activity</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {ACTIVITY_PILLS.map((key) => (
                <PillButton
                  key={key}
                  label={getActivityDisplayName(key)}
                  active={activityType === key}
                  onPress={() => setActivityType(key)}
                />
              ))}
            </View>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>Duration</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{duration} min</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <Pressable
                  onPress={() => adjustDuration(-5)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20, color: colors.text }}>−</Text>
                </Pressable>
                <View style={{ flex: 1, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2 }}>
                  <View
                    style={{
                      height: "100%",
                      width: `${((duration - 5) / 115) * 100}%`,
                      backgroundColor: colors.brand,
                      borderRadius: 2,
                    }}
                  />
                </View>
                <Pressable
                  onPress={() => adjustDuration(5)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20, color: colors.text }}>+</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: colors.textLight }}>5 min</Text>
                <Text style={{ fontSize: 12, color: colors.textLight }}>120 min</Text>
              </View>
            </View>
            <View
              style={{
                borderRadius: 8,
                backgroundColor: colors.exerciseBg,
                borderWidth: 1,
                borderColor: colors.exerciseBorder,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Estimated burn
              </Text>
              <Text style={{ fontSize: 28, fontWeight: "700", color: colors.brand }}>
                {formatNumber(estimatedCalories)} kcal
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton label="Cancel" onPress={() => setShowForm(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label={saving ? "Saving…" : "Save activity"}
                  onPress={handleSave}
                  disabled={saving}
                  loading={saving}
                />
              </View>
            </View>
          </Card>
        ) : null}

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Text
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              fontWeight: "600",
              color: colors.text,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            Today's activities
          </Text>
          {loading ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.brand} />
            </View>
          ) : todayActivities.length === 0 ? (
            <Text style={{ padding: 24, textAlign: "center", color: colors.textMuted, fontSize: 14 }}>
              No activities logged today.
            </Text>
          ) : (
            todayActivities.map((act, idx) => (
              <View
                key={act.id}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopWidth: idx > 0 ? 1 : 0,
                  borderTopColor: "#f3f4f6",
                }}
              >
                <ActivityRow act={act} />
              </View>
            ))
          )}
        </Card>

        {weekActivities.length > 0 ? (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Text
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                fontWeight: "600",
                color: colors.text,
                borderBottomWidth: 1,
                borderBottomColor: "#f3f4f6",
              }}
            >
              This week
            </Text>
            {weekActivities.map((act, idx) => (
              <View
                key={act.id}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopWidth: idx > 0 ? 1 : 0,
                  borderTopColor: "#f3f4f6",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: colors.mint,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Activity size={20} color={colors.brand} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: colors.text }}>
                      {getActivityDisplayName(act.activity_name)}
                      {act.duration_minutes ? ` · ${act.duration_minutes} min` : ""}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                      {formatWeekDate(act.activity_date)}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>
                    {formatNumber(act.calories)} kcal
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}
