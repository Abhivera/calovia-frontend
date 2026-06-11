import { useEffect, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { ArrowUpRight, Flame } from "lucide-react-native";
import AppShell from "@/components/layout/AppShell";
import MacroRings from "@/components/dashboard/MacroRings";
import StepBarChart from "@/components/dashboard/StepBarChart";
import { Card } from "@/components/ui/Common";
import { getNetCalories, getStreak } from "@/api/user";
import { getTodayMealSummary } from "@/api/meal";
import { getStepsSummary } from "@/api/steps";
import {
  formatLongDate,
  formatNumber,
  formatTime,
  getGreeting,
  getUtcDateString,
} from "@/lib/format";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { colors } from "@/theme/colors";

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>{title}</Text>
      {children}
    </Card>
  );
}

function aggregateMacros(meals: { analysis?: { nutrients?: Record<string, number> } }[]) {
  return (meals || []).reduce(
    (acc, meal) => {
      const n = meal.analysis?.nutrients || {};
      acc.protein += n.protein || 0;
      acc.carbs += n.carbs || 0;
      acc.fat += n.fat || 0;
      acc.sugar += n.sugar || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, sugar: 0 }
  );
}

export default function DashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [netCalories, setNetCalories] = useState<Record<string, number> | null>(null);
  const [streak, setStreak] = useState<Record<string, number> | null>(null);
  const [mealSummary, setMealSummary] = useState<Record<string, unknown> | null>(null);
  const [stepDays, setStepDays] = useState<{ date: string; steps: number; distance_km?: number; kcal_burned?: number }[]>([]);
  const [todaySteps, setTodaySteps] = useState<(typeof stepDays)[0] | null>(null);

  const today = getUtcDateString();
  const stepGoal = user?.step_goal || 8000;
  const calorieGoal = 2500;

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const end = today;
        const startDate = new Date(`${today}T12:00:00Z`);
        startDate.setUTCDate(startDate.getUTCDate() - 6);
        const start = getUtcDateString(startDate);

        const [net, streakData, meals, steps] = await Promise.all([
          getNetCalories(today),
          getStreak(),
          getTodayMealSummary(),
          getStepsSummary({ start_date: start, end_date: end }),
        ]);

        if (!active) return;
        setNetCalories(net);
        setStreak(streakData);
        setMealSummary(meals);
        const days = steps?.days || [];
        setStepDays(days);
        setTodaySteps(days[days.length - 1] || null);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [today]);

  const meals = (mealSummary?.meals as Record<string, unknown>[]) || [];
  const macros = aggregateMacros(meals);
  const exercise = mealSummary?.total_exercise as { steps?: number; walking_km?: number } | undefined;
  const eaten = netCalories?.calories_eaten ?? (mealSummary?.total_calories as number) ?? 0;
  const manualBurn = netCalories?.calories_burned_manual ?? 0;
  const stepsBurn = netCalories?.calories_burned_steps ?? 0;
  const totalBurn = netCalories?.calories_burned_total ?? manualBurn + stepsBurn;
  const net = netCalories?.net_calories ?? eaten - totalBurn;

  return (
    <AppShell>
      <View style={{ padding: 24, maxWidth: 1152, alignSelf: "center", width: "100%", gap: 24 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
              {getGreeting(user?.full_name)} 👋
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              {formatLongDate(new Date())}
            </Text>
          </View>
          <Link href="/meal-log" asChild>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.brand,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Log meal</Text>
              <ArrowUpRight size={16} color="#fff" />
            </Pressable>
          </Link>
        </View>

        {loading ? (
          <Text style={{ color: colors.brand }}>Loading…</Text>
        ) : (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              <StatCard title="Calories eaten">
                <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
                  {formatNumber(eaten)}
                </Text>
                <View style={{ marginTop: 12, height: 6, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min((eaten / calorieGoal) * 100, 100)}%`,
                      backgroundColor: colors.brand,
                      borderRadius: 999,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 6 }}>
                  of {formatNumber(calorieGoal)} goal
                </Text>
              </StatCard>

              <StatCard title="Calories burned">
                <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
                  {formatNumber(totalBurn)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
                  {formatNumber(manualBurn)} manual · {formatNumber(stepsBurn)} steps
                </Text>
              </StatCard>

              <StatCard title="Net calories">
                <Text style={{ fontSize: 28, fontWeight: "700", color: colors.brand }}>
                  {formatNumber(net)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>eaten − burned</Text>
              </StatCard>

              <StatCard title="Streak">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Flame size={24} color={colors.orange} />
                  <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
                    {streak?.current_streak ?? 0} days
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
                  Longest: {streak?.longest_streak ?? 0} days
                </Text>
              </StatCard>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              <Card style={{ flex: 1, minWidth: 280 }}>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 16 }}>
                  Steps this week · Goal {formatNumber(stepGoal)}/day
                </Text>
                <StepBarChart days={stepDays} stepGoal={stepGoal} />
                {todaySteps ? (
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
                    {formatNumber(todaySteps.steps)} steps · {todaySteps.distance_km ?? 0} km · {formatNumber(todaySteps.kcal_burned ?? 0)} kcal
                  </Text>
                ) : null}
              </Card>

              <Card style={{ flex: 1, minWidth: 280 }}>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 }}>
                  <Link href="/meal-log" asChild>
                    <Pressable>
                      <Text style={{ fontSize: 12, color: colors.brand, fontWeight: "500" }}>View all →</Text>
                    </Pressable>
                  </Link>
                </View>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>Today's meals</Text>
                {meals.length === 0 ? (
                  <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center", paddingVertical: 16 }}>
                    No meals logged today.{" "}
                    <Link href="/meal-log" style={{ color: colors.brand }}>Log one</Link>
                  </Text>
                ) : (
                  meals.slice(0, 5).map((meal) => {
                    const analysis = meal.analysis as Record<string, unknown> | undefined;
                    return (
                      <View key={meal.id as string} style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.mint, overflow: "hidden" }}>
                          {meal.file_url ? (
                            <Image source={{ uri: meal.file_url as string }} style={{ width: 48, height: 48 }} />
                          ) : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontWeight: "500", fontSize: 14, color: colors.text, flex: 1 }} numberOfLines={1}>
                              {(analysis?.meal_name as string) || (meal.original_filename as string)}
                            </Text>
                            <Text style={{ fontWeight: "600", fontSize: 14, color: colors.text }}>
                              {analysis?.calories as number} kcal
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12, color: colors.textLight }}>
                            {formatTime(meal.created_at as string)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </Card>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              <Card style={{ flex: 1, minWidth: 280 }}>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>Macros today</Text>
                <MacroRings nutrients={macros} />
              </Card>
              <Card style={{ flex: 1, minWidth: 280 }}>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 12 }}>Exercise rec.</Text>
                {exercise ? (
                  <View style={{ flexDirection: "row", gap: 40, paddingTop: 8 }}>
                    <View>
                      <Text style={{ fontSize: 28, fontWeight: "700", color: colors.brand }}>
                        {formatNumber(exercise.steps ?? 0)}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>Suggested steps</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
                        {exercise.walking_km} km
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }}>Walking distance</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={{ fontSize: 14, color: colors.textMuted, paddingVertical: 16 }}>
                    Log meals today to see exercise recommendations.
                  </Text>
                )}
              </Card>
            </View>
          </>
        )}
      </View>
    </AppShell>
  );
}
