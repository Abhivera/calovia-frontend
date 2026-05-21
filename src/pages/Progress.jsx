import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import AppShell from "@/components/Layout/AppShell";
import PillButton from "@/components/ui/PillButton";
import { getMealSummary } from "@/api/meal";
import { getNetCalories, getStreak, getUser } from "@/api/user";
import { getStepsSummary } from "@/api/steps";
import { getUserCalories } from "@/api/userCalories";
import {
  formatNumber,
  getUtcDateString,
  mealPeriodParams,
  utcDateRange,
} from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { Flame } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RANGES = [
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
  { id: 90, label: "90 days" },
];

const DEFAULT_STEP_GOAL = 8000;

function chartLabel(dateStr, totalDays) {
  const d = new Date(dateStr + "T12:00:00");
  if (totalDays <= 14) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs mt-1 text-gray-500">{sub}</p>}
    </div>
  );
}

function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value}g</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function Progress() {
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0, sugar: 0 });
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [prevWeekAvg, setPrevWeekAvg] = useState({ eaten: 0, burn: 0 });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const dates = utcDateRange(range);
      const start = dates[0];
      const end = dates[dates.length - 1];

      try {
        const [stepsRes, calorieEntries, userRes, streakRes, ...netResults] =
          await Promise.all([
            getStepsSummary({ start_date: start, end_date: end }).catch(() => ({
              days: [],
            })),
            getUserCalories({ start_date: start, end_date: end }).catch(() => []),
            getUser().catch(() => null),
            getStreak().catch(() => null),
            ...dates.map((d) => getNetCalories(d).catch(() => null)),
          ]);

        if (!active) return;

        const stepsByDate = Object.fromEntries(
          (stepsRes?.days || []).map((d) => [d.date, d.steps || 0])
        );

        const points = dates.map((date, i) => {
          const net = netResults[i];
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

        const mealParams =
          range === 7
            ? mealPeriodParams("week")
            : mealPeriodParams("month");
        const summary = await getMealSummary(mealParams).catch(() => null);
        if (summary?.meals?.length) {
          const agg = summary.meals.reduce(
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
          prevNets.reduce((s, n) => s + (n?.calories_eaten || 0), 0) / 7;
        const burnAvg =
          prevNets.reduce((s, n) => s + (n?.calories_burned_total || 0), 0) / 7;
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
    return Math.round(
      chartData.reduce((s, d) => s + d.eaten, 0) / chartData.length
    );
  }, [chartData]);

  const avgBurn = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(
      chartData.reduce((s, d) => s + d.burned, 0) / chartData.length
    );
  }, [chartData]);

  const avgSteps = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(
      chartData.reduce((s, d) => s + d.steps, 0) / chartData.length
    );
  }, [chartData]);

  const eatenDelta = avgEaten - (prevWeekAvg.eaten || avgEaten);
  const burnDelta = avgBurn - (prevWeekAvg.burn || avgBurn);

  const weight = user?.weight ?? 65;
  const goalWeight = user?.goal_weight ?? 60;
  const startWeight = user?.weight ? Math.max(user.weight, goalWeight + 5) : 70;
  const weightProgress =
    startWeight > goalWeight
      ? ((startWeight - weight) / (startWeight - goalWeight)) * 100
      : 100;
  const weightPct = Math.min(Math.max(weightProgress, 0), 100);

  const lineChartData = {
    labels: chartData.map((d) => d.label),
    datasets: [
      {
        label: "Eaten",
        data: chartData.map((d) => d.eaten),
        borderColor: "#24a17b",
        backgroundColor: "rgba(36, 161, 123, 0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: "Burned",
        data: chartData.map((d) => d.burned),
        borderColor: "#f97316",
        borderDash: [6, 4],
        fill: false,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const barChartData = {
    labels: chartData.slice(-7).map((d) => d.label),
    datasets: [
      {
        label: "Steps",
        data: chartData.slice(-7).map((d) => d.steps),
        backgroundColor: chartData.slice(-7).map((d) =>
          d.steps >= stepGoal ? "#24a17b" : "#c5e8dc"
        ),
        borderRadius: 6,
      },
    ],
  };

  const macroMax = Math.max(macros.protein, macros.carbs, macros.fat, macros.sugar, 1);
  const stepGoal = user?.step_goal ?? DEFAULT_STEP_GOAL;

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Your trends over time
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map(({ id, label }) => (
              <PillButton
                key={id}
                active={range === id}
                onClick={() => setRange(id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Avg daily calories"
            value={loading ? "—" : formatNumber(avgEaten)}
            sub={
              !loading && (
                <span className={eatenDelta <= 0 ? "text-[#24a17b]" : "text-amber-600"}>
                  {eatenDelta <= 0 ? "▼" : "▲"}{" "}
                  {Math.abs(Math.round(eatenDelta))} vs last week
                </span>
              )
            }
          />
          <StatCard
            title="Avg daily burn"
            value={loading ? "—" : `${formatNumber(avgBurn)} kcal`}
            sub={
              !loading && (
                <span className="text-[#24a17b]">
                  ▲ {Math.max(0, Math.round(burnDelta))} vs last week
                </span>
              )
            }
          />
          <StatCard
            title="Avg daily steps"
            value={loading ? "—" : formatNumber(avgSteps)}
            sub={`Goal: ${formatNumber(stepGoal)}`}
          />
          <StatCard
            title="Longest streak"
            value={
              loading ? "—" : `${streak?.longest_streak ?? 0} days`
            }
            sub={
              <span className="flex items-center gap-1">
                Current: {streak?.current_streak ?? 0}
                <Flame className="w-3 h-3 text-orange-500" />
              </span>
            }
          />
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Calories in vs burned
          </h2>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <div className="h-64">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 600 },
                  plugins: {
                    legend: { position: "top", align: "end" },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Daily steps</h2>
            {loading ? (
              <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
            ) : (
              <div className="h-48">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 600 },
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Dark green = goal met ({formatNumber(stepGoal)}+)
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Weight progress</h2>
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="text-gray-500">Current</p>
                <p className="text-2xl font-bold text-gray-900">{weight} kg</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Goal</p>
                <p className="text-2xl font-bold text-[#24a17b]">{goalWeight} kg</p>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#24a17b] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${weightPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {Math.max(0, weight - goalWeight)} kg to go · started at {startWeight}{" "}
              kg
            </p>
          </section>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Macros breakdown — weekly avg
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <MacroBar
              label="Protein"
              value={macros.protein}
              max={macroMax}
              color="#24a17b"
            />
            <MacroBar
              label="Carbs"
              value={macros.carbs}
              max={macroMax}
              color="#eab308"
            />
            <MacroBar
              label="Fat"
              value={macros.fat}
              max={macroMax}
              color="#f97316"
            />
            <MacroBar
              label="Sugar"
              value={macros.sugar}
              max={macroMax}
              color="#06b6d4"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
