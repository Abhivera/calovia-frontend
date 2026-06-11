import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { Flame } from "lucide-react-native";
import AppShell from "@/components/layout/AppShell";
import PillButton from "@/components/ui/PillButton";
import { Card } from "@/components/ui/Common";
import { getMealSummary } from "@/api/meal";
import { getStepsSummary } from "@/api/steps";
import { getNetCalories, getStreak, getUser } from "@/api/user";
import { getUserCalories } from "@/api/userCalories";
import {
  formatNumber,
  getUtcDateString,
  mealPeriodParams,
  utcDateRange,
} from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { colors } from "@/theme/colors";
import type { User } from "@/types/user";

const RANGES = [
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" },
];

const DEFAULT_STEP_GOAL = 8000;

type ChartPoint = {
  date: string;
  label: string;
  eaten: number;
  burned: number;
  steps: number;
};

function chartLabel(dateStr: string, totalDays: number) {
  const d = new Date(dateStr + "T12:00:00");
  if (totalDays <= 14) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>{title}</Text>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{value}</Text>
      {sub ? <View style={{ marginTop: 4 }}>{sub}</View> : null}
    </Card>
  );
}

function MacroBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.textMuted }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{value}g</Text>
      </View>
      <View style={{ height: 8, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: 999 }} />
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 80, 600);

  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0, sugar: 0 });
  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<Record<string, number> | null>(null);
  const [prevWeekAvg, setPrevWeekAvg] = useState({ eaten: 0, burn: 0 });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const dates = utcDateRange(range);
      const start = dates[0];
      const end = dates[dates.length - 1];

      try {
        const [stepsRes, , userRes, streakRes, ...netResults] = await Promise.all([
          getStepsSummary({ start_date: start, end_date: end }).catch(() => ({ days: [] })),
          getUserCalories({ start_date: start, end_date: end }).catch(() => []),
          getUser().catch(() => null),
          getStreak().catch(() => null),
          ...dates.map((d) => getNetCalories(d).catch(() => null)),
        ]);

        if (!active) return;

        const stepsByDate = Object.fromEntries(
          ((stepsRes?.days || []) as { date: string; steps?: number }[]).map((d) => [
            d.date,
            d.steps || 0,
          ])
        );

        const points = dates.map((date, i) => {
          const net = netResults[i] as Record<string, number> | null;
          return {
            date,
            label: chartLabel(date, range),
            eaten: net?.calories_eaten ?? 0,
            burned: net?.calories_burned_total ?? 0,
            steps: stepsByDate[date] ?? 0,
          };
        });

        setChartData(points);
        setUser(userRes);
        setStreak(streakRes);

        const mealParams = range === 7 ? mealPeriodParams("week") : mealPeriodParams("month");
        const summary = await getMealSummary(mealParams).catch(() => null);
        if (summary?.meals?.length) {
          const agg = (summary.meals as { analysis?: { nutrients?: Record<string, number> } }[]).reduce(
            (acc, m) => {
              const n = m.analysis?.nutrients || {};
              acc.protein += n.protein || 0;
              acc.carbs += n.carbs || 0;
              acc.fat += n.fat || 0;
              acc.sugar += n.sugar || 0;
              return acc;
            },
            { protein: 0, carbs: 0, fat: 0, sugar: 0 }
          );
          const div = summary.meals.length || 1;
          setMacros({
            protein: Math.round(agg.protein / div),
            carbs: Math.round(agg.carbs / div),
            fat: Math.round(agg.fat / div),
            sugar: Math.round(agg.sugar / div),
          });
        } else {
          setMacros({ protein: 0, carbs: 0, fat: 0, sugar: 0 });
        }

        const prevDates = utcDateRange(7).map((_, i) => {
          const d = new Date(`${dates[0]}T12:00:00Z`);
          d.setUTCDate(d.getUTCDate() - (7 - i));
          return getUtcDateString(d);
        });
        const prevNets = await Promise.all(
          prevDates.map((d) => getNetCalories(d).catch(() => null))
        );
        const eatenAvg =
          prevNets.reduce((s, n) => s + ((n as Record<string, number> | null)?.calories_eaten || 0), 0) / 7;
        const burnAvg =
          prevNets.reduce(
            (s, n) => s + ((n as Record<string, number> | null)?.calories_burned_total || 0),
            0
          ) / 7;
        setPrevWeekAvg({ eaten: eatenAvg, burn: burnAvg });
      } catch (err) {
        console.error("Progress load error:", getApiErrorMessage(err));
        setChartData([]);
        setMacros({ protein: 0, carbs: 0, fat: 0, sugar: 0 });
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [range]);

  const avgEaten = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(chartData.reduce((s, d) => s + d.eaten, 0) / chartData.length);
  }, [chartData]);

  const avgBurn = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(chartData.reduce((s, d) => s + d.burned, 0) / chartData.length);
  }, [chartData]);

  const avgSteps = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(chartData.reduce((s, d) => s + d.steps, 0) / chartData.length);
  }, [chartData]);

  const eatenDelta = avgEaten - (prevWeekAvg.eaten || avgEaten);
  const burnDelta = avgBurn - (prevWeekAvg.burn || avgBurn);

  const weight = user?.weight ?? 65;
  const goalWeight = user?.goal_weight ?? 60;
  const startWeight = user?.weight ? Math.max(user.weight, goalWeight + 5) : 70;
  const weightProgress =
    startWeight > goalWeight ? ((startWeight - weight) / (startWeight - goalWeight)) * 100 : 100;
  const weightPct = Math.min(Math.max(weightProgress, 0), 100);

  const stepGoal = user?.step_goal ?? DEFAULT_STEP_GOAL;
  const macroMax = Math.max(macros.protein, macros.carbs, macros.fat, macros.sugar, 1);

  const eatenLineData = chartData.map((d) => ({ value: d.eaten, label: d.label }));
  const burnedLineData = chartData.map((d) => ({ value: d.burned, label: d.label }));
  const barData = chartData.slice(-7).map((d) => ({
    value: d.steps,
    label: d.label,
    frontColor: d.steps >= stepGoal ? colors.brand : colors.exerciseBorder,
  }));

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 1024, alignSelf: "center", width: "100%", gap: 24 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Progress</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>Your trends over time</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {RANGES.map(({ id, label }) => (
              <PillButton
                key={id}
                label={label}
                active={range === id}
                onPress={() => setRange(id)}
              />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          <StatCard
            title="Avg daily calories"
            value={loading ? "—" : formatNumber(avgEaten)}
            sub={
              !loading ? (
                <Text style={{ fontSize: 12, color: eatenDelta <= 0 ? colors.brand : colors.orange }}>
                  {eatenDelta <= 0 ? "▼" : "▲"} {Math.abs(Math.round(eatenDelta))} vs last week
                </Text>
              ) : undefined
            }
          />
          <StatCard
            title="Avg daily burn"
            value={loading ? "—" : `${formatNumber(avgBurn)} kcal`}
            sub={
              !loading ? (
                <Text style={{ fontSize: 12, color: colors.brand }}>
                  ▲ {Math.max(0, Math.round(burnDelta))} vs last week
                </Text>
              ) : undefined
            }
          />
          <StatCard
            title="Avg daily steps"
            value={loading ? "—" : formatNumber(avgSteps)}
            sub={<Text style={{ fontSize: 12, color: colors.textMuted }}>Goal: {formatNumber(stepGoal)}</Text>}
          />
          <StatCard
            title="Longest streak"
            value={loading ? "—" : `${streak?.longest_streak ?? 0} days`}
            sub={
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  Current: {streak?.current_streak ?? 0}
                </Text>
                <Flame size={12} color={colors.orange} />
              </View>
            }
          />
        </View>

        <Card>
          <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 16 }}>
            Calories in vs burned
          </Text>
          {loading ? (
            <View style={{ height: 200, backgroundColor: "#f9fafb", borderRadius: 8 }} />
          ) : chartData.length > 0 ? (
            <View style={{ alignItems: "center" }}>
              <LineChart
                dataSet={[
                  { data: eatenLineData, color: colors.brand, dataPointsColor: colors.brand },
                  { data: burnedLineData, color: colors.orange, dataPointsColor: colors.orange },
                ]}
                height={200}
                width={chartWidth}
                spacing={Math.max(20, chartWidth / Math.max(chartData.length, 1) - 10)}
                initialSpacing={10}
                endSpacing={10}
                yAxisColor={colors.border}
                xAxisColor={colors.border}
                yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                noOfSections={4}
                animateOnDataChange
              />
              <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 12, height: 3, backgroundColor: colors.brand, borderRadius: 2 }} />
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Eaten</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 12, height: 3, backgroundColor: colors.orange, borderRadius: 2 }} />
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Burned</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={{ textAlign: "center", color: colors.textMuted, paddingVertical: 40 }}>No data yet</Text>
          )}
        </Card>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          <Card style={{ flex: 1, minWidth: 280 }}>
            <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 16 }}>Daily steps</Text>
            {loading ? (
              <View style={{ height: 180, backgroundColor: "#f9fafb", borderRadius: 8 }} />
            ) : barData.length > 0 ? (
              <View style={{ alignItems: "center" }}>
                <BarChart
                  data={barData}
                  height={180}
                  width={Math.min(chartWidth, 320)}
                  barWidth={28}
                  spacing={16}
                  roundedTop
                  roundedBottom
                  hideRules
                  xAxisThickness={1}
                  yAxisThickness={1}
                  yAxisColor={colors.border}
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                  noOfSections={4}
                  isAnimated
                />
              </View>
            ) : (
              <Text style={{ textAlign: "center", color: colors.textMuted, paddingVertical: 40 }}>No data yet</Text>
            )}
            <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 8 }}>
              Dark green = goal met ({formatNumber(stepGoal)}+)
            </Text>
          </Card>

          <Card style={{ flex: 1, minWidth: 280 }}>
            <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 16 }}>Weight progress</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>Current</Text>
                <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{weight} kg</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>Goal</Text>
                <Text style={{ fontSize: 22, fontWeight: "700", color: colors.brand }}>{goalWeight} kg</Text>
              </View>
            </View>
            <View style={{ height: 12, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  width: `${weightPct}%`,
                  backgroundColor: colors.brand,
                  borderRadius: 999,
                }}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 12 }}>
              {Math.max(0, weight - goalWeight)} kg to go · started at {startWeight} kg
            </Text>
          </Card>
        </View>

        <Card>
          <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 16 }}>
            Macros breakdown — weekly avg
          </Text>
          <View style={{ gap: 16 }}>
            <MacroBar label="Protein" value={macros.protein} max={macroMax} color={colors.brand} />
            <MacroBar label="Carbs" value={macros.carbs} max={macroMax} color={colors.yellow} />
            <MacroBar label="Fat" value={macros.fat} max={macroMax} color={colors.orange} />
            <MacroBar label="Sugar" value={macros.sugar} max={macroMax} color={colors.cyan} />
          </View>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
