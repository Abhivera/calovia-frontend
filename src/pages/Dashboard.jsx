import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AppShell from "@/components/Layout/AppShell";
import MacroRings from "@/components/dashboard/MacroRings";
import StepBarChart from "@/components/dashboard/StepBarChart";
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
import { ArrowUpRight, Flame } from "lucide-react";

function StatCard({ title, children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}
    >
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      {children}
    </div>
  );
}

function aggregateMacros(meals) {
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

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [netCalories, setNetCalories] = useState(null);
  const [streak, setStreak] = useState(null);
  const [mealSummary, setMealSummary] = useState(null);
  const [stepDays, setStepDays] = useState([]);
  const [todaySteps, setTodaySteps] = useState(null);

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

  const macros = aggregateMacros(mealSummary?.meals);
  const exercise = mealSummary?.total_exercise;
  const eaten = netCalories?.calories_eaten ?? mealSummary?.total_calories ?? 0;
  const manualBurn = netCalories?.calories_burned_manual ?? 0;
  const stepsBurn = netCalories?.calories_burned_steps ?? 0;
  const totalBurn =
    netCalories?.calories_burned_total ?? manualBurn + stepsBurn;
  const net = netCalories?.net_calories ?? eaten - totalBurn;

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting(user?.full_name)} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatLongDate(new Date())}
            </p>
          </div>
          <Link
            to="/meal-log"
            className="inline-flex items-center justify-center gap-1.5 bg-[#24a17b] hover:bg-[#1e8a6a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Log meal
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-white border border-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Calories eaten">
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(eaten)}
                </p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#24a17b] rounded-full"
                    style={{
                      width: `${Math.min((eaten / calorieGoal) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  of {formatNumber(calorieGoal)} goal
                </p>
              </StatCard>

              <StatCard title="Calories burned">
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(totalBurn)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatNumber(manualBurn)} manual · {formatNumber(stepsBurn)}{" "}
                  steps
                </p>
              </StatCard>

              <StatCard title="Net calories">
                <p className="text-3xl font-bold text-[#24a17b]">
                  {formatNumber(net)}
                </p>
                <p className="text-xs text-gray-500 mt-2">eaten − burned</p>
              </StatCard>

              <StatCard title="Streak">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <p className="text-3xl font-bold text-gray-900">
                    {streak?.current_streak ?? 0} days
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Longest: {streak?.longest_streak ?? 0} days
                </p>
              </StatCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <StatCard title="Steps this week">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400">
                    Goal {formatNumber(stepGoal)}/day
                  </span>
                </div>
                <StepBarChart days={stepDays} stepGoal={stepGoal} />
                {todaySteps && (
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    {formatNumber(todaySteps.steps)} steps ·{" "}
                    {todaySteps.distance_km ?? 0} km ·{" "}
                    {formatNumber(todaySteps.kcal_burned)} kcal
                  </p>
                )}
              </StatCard>

              <StatCard title="Today's meals">
                <div className="flex items-center justify-between mb-3">
                  <span />
                  <Link
                    to="/meal-log"
                    className="text-xs text-[#24a17b] font-medium hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <ul className="space-y-4">
                  {(mealSummary?.meals || []).length === 0 ? (
                    <li className="text-sm text-gray-500 py-4 text-center">
                      No meals logged today.{" "}
                      <Link to="/meal-log" className="text-[#24a17b] underline">
                        Log one
                      </Link>
                    </li>
                  ) : (
                    mealSummary.meals.slice(0, 5).map((meal) => (
                      <li key={meal.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#e8f5f0] shrink-0 overflow-hidden">
                          {meal.file_url ? (
                            <img
                              src={meal.file_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {meal.analysis?.meal_name ||
                                meal.original_filename}
                            </p>
                            <span className="text-sm font-semibold text-gray-700 shrink-0">
                              {meal.analysis?.calories} kcal
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatTime(meal.created_at)}
                          </p>
                          {meal.analysis?.food_items?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {meal.analysis.food_items.join(", ")}
                            </p>
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </StatCard>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <StatCard title="Macros today">
                <MacroRings nutrients={macros} />
              </StatCard>

              <StatCard title="Exercise rec.">
                {exercise ? (
                  <div className="flex gap-10 pt-2">
                    <div>
                      <p className="text-3xl font-bold text-[#24a17b]">
                        {formatNumber(exercise.steps)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested steps
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {exercise.walking_km} km
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Walking distance
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4">
                    Log meals today to see exercise recommendations.
                  </p>
                )}
              </StatCard>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
