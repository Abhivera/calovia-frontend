import { useCallback, useEffect, useRef, useState } from "react";
import AppShell from "@/components/Layout/AppShell";
import MacroRings from "@/components/dashboard/MacroRings";
import MealAnalysisResult from "@/components/meal/MealAnalysisResult";
import PillButton from "@/components/ui/PillButton";
import {
  getAllImages,
  uploadAndAnalyzeImage,
  deleteImage,
  relogImage,
  updateImageIsMeal,
} from "@/api/images";
import { getMealSummary } from "@/api/meal";
import {
  formatLongDate,
  formatNumber,
  formatTime,
  mealPeriodParams,
} from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const CALORIE_GOAL = 2500;

const DATE_RANGES = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

const LIST_FILTERS = [
  { id: "all", label: "All" },
  { id: "meals", label: "Meals only" },
  { id: "snacks", label: "Snacks" },
];

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

function isSnack(meal) {
  const a = meal.analysis;
  return a?.is_food && a?.is_meal === false;
}

function isMealEntry(meal) {
  return meal.analysis?.is_meal === true;
}

function filterMealsList(meals, listFilter) {
  if (listFilter === "meals") return meals.filter(isMealEntry);
  if (listFilter === "snacks") return meals.filter(isSnack);
  return meals.filter((m) => m.analysis?.is_food);
}

function SummaryCard({ title, children }) {
  return (
    <div className="bg-[#f5f0e8] border border-[#ebe4d6] rounded-xl p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      {children}
    </div>
  );
}

export default function MealLog() {
  const fileRef = useRef(null);
  const uploadRef = useRef(null);

  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");
  const [listFilter, setListFilter] = useState("all");

  const [showUpload, setShowUpload] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingAnalysis, setPendingAnalysis] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const loadData = useCallback(async () => {
    setLoading(true);
    const params = mealPeriodParams(dateRange);
    try {
      const [imagesRes, summaryRes] = await Promise.all([
        getAllImages({ ...params, limit: 100 }),
        getMealSummary(params).catch(() => null),
      ]);
      const list = (imagesRes.images || []).filter((img) => img.analysis?.is_food);
      setMeals(list);
      setSummary(summaryRes);
    } catch {
      toast.error("Could not load meals");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedMeals = filterMealsList(meals, listFilter);

  const mealCount =
    summary?.total_meals ??
    meals.filter(isMealEntry).length;
  const totalCalories =
    summary?.total_calories ??
    meals.filter(isMealEntry).reduce((s, m) => s + (m.analysis?.calories || 0), 0);
  const totalExerciseSteps =
    summary?.total_exercise?.steps ??
    meals
      .filter(isMealEntry)
      .reduce(
        (s, m) => s + (m.analysis?.exercise_recommendations?.steps || 0),
        0
      );

  const macros = aggregateMacros(
    meals.filter((m) => m.analysis?.is_meal)
  );

  const clearPending = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingImage(null);
    setPendingAnalysis(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openUpload = () => {
    setShowUpload(true);
    requestAnimationFrame(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a JPEG or PNG image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }

    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzing(true);
    setPendingImage(null);
    setPendingAnalysis(null);

    try {
      const res = await uploadAndAnalyzeImage(file);
      if (res?.image?.analysis) {
        setPendingImage(res.image);
        setPendingAnalysis(res.image.analysis);
      } else {
        toast.error("Analysis completed but no nutrition data was returned");
        clearPending();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      clearPending();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!pendingAnalysis || !pendingImage?.id) return;
    setSaving(true);
    try {
      if (!pendingAnalysis.is_meal) {
        await updateImageIsMeal(pendingImage.id, true);
      }
      toast.success("Meal saved");
      await loadData();
      clearPending();
      setShowUpload(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    try {
      if (pendingImage?.id) {
        await deleteImage(pendingImage.id);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      return;
    }
    clearPending();
    setShowUpload(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteImage(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              total_meals: Math.max(0, (prev.total_meals ?? 1) - 1),
            }
          : prev
      );
      await loadData();
      toast.success("Meal removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleRelog = async (id) => {
    try {
      const res = await relogImage(id);
      if (res?.image) {
        await loadData();
        toast.success("Meal logged again");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const mealsSectionTitle =
    dateRange === "today"
      ? "Today's meals"
      : dateRange === "week"
        ? "This week's meals"
        : "This month's meals";

  return (
    <AppShell>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meal log</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatLongDate(new Date())}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {DATE_RANGES.map(({ id, label }) => (
                <PillButton
                  key={id}
                  active={dateRange === id}
                  onClick={() => setDateRange(id)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={openUpload}
            className="shrink-0 self-start bg-[#24a17b] hover:bg-[#1e8a6a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Log meal
          </button>
        </header>

        <div className="grid sm:grid-cols-3 gap-4">
          <SummaryCard title="Meals logged">
            <p className="text-3xl font-bold text-gray-900">
              {loading ? "—" : mealCount}
            </p>
          </SummaryCard>
          <SummaryCard title="Total calories">
            <p className="text-3xl font-bold text-[#24a17b]">
              {loading ? "—" : formatNumber(totalCalories)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of {formatNumber(CALORIE_GOAL)} goal
            </p>
          </SummaryCard>
          <SummaryCard title="Total exercise rec.">
            <p className="text-3xl font-bold text-gray-900">
              {loading ? "—" : formatNumber(totalExerciseSteps)}
            </p>
            <p className="text-xs text-gray-500 mt-1">steps suggested</p>
          </SummaryCard>
        </div>

        {showUpload && (
          <section ref={uploadRef} className="space-y-4">
            {!pendingAnalysis && !analyzing && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-white hover:border-[#24a17b] hover:bg-[#fafcfb] transition-colors"
              >
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Take or upload a photo of your meal
                </p>
                <p className="text-sm text-gray-500 mb-5">
                  Our AI will detect food items and estimate calories
                </p>
                <span className="inline-block bg-[#24a17b] text-white px-6 py-2.5 rounded-lg text-sm font-semibold">
                  Choose photo
                </span>
                <p className="text-xs text-gray-400 mt-4">
                  JPEG, PNG · max 10 MB
                </p>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {analyzing && (
              <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center gap-3">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="w-40 h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <Loader2 className="w-8 h-8 text-[#24a17b] animate-spin" />
                <p className="text-sm font-medium text-gray-700">
                  Analyzing your meal…
                </p>
              </div>
            )}

            {pendingAnalysis && !analyzing && (
              <div className="space-y-3">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Meal"
                    className="w-full max-h-48 object-cover rounded-xl"
                  />
                )}
                {pendingAnalysis.meal_name && (
                  <h3 className="text-lg font-semibold text-gray-900 px-1">
                    {pendingAnalysis.meal_name}
                  </h3>
                )}
                <MealAnalysisResult
                  analysis={pendingAnalysis}
                  onSave={handleSaveMeal}
                  onDiscard={handleDiscard}
                  saving={saving}
                />
              </div>
            )}
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-semibold text-gray-900">{mealsSectionTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {LIST_FILTERS.map(({ id, label }) => (
                <PillButton
                  key={id}
                  active={listFilter === id}
                  onClick={() => setListFilter(id)}
                >
                  {label}
                </PillButton>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-gray-500 text-center">Loading…</p>
          ) : displayedMeals.length === 0 ? (
            <p className="p-6 text-sm text-gray-500 text-center">
              No meals in this period.
            </p>
          ) : (
            <ul>
              {displayedMeals.map((meal, idx) => {
                const n = meal.analysis?.nutrients || {};
                return (
                  <li
                    key={meal.id}
                    className={`px-5 py-4 ${
                      idx > 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-[#e8f5f0] shrink-0 overflow-hidden">
                        {meal.file_url ? (
                          <img
                            src={meal.file_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {meal.analysis?.meal_name ||
                                meal.original_filename}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatTime(meal.created_at)}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 shrink-0">
                            {formatNumber(meal.analysis?.calories)} kcal
                          </p>
                        </div>
                        {meal.analysis?.food_items?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                            {meal.analysis.food_items.join(", ")}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>
                            Protein{" "}
                            <strong className="text-gray-800">
                              {n.protein ?? 0}g
                            </strong>
                          </span>
                          <span>
                            Carbs{" "}
                            <strong className="text-gray-800">
                              {n.carbs ?? 0}g
                            </strong>
                          </span>
                          <span>
                            Fat{" "}
                            <strong className="text-gray-800">
                              {n.fat ?? 0}g
                            </strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDelete(meal.id)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                          aria-label="Delete meal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRelog(meal.id)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-[#24a17b] hover:border-[#c5e8dc] hover:bg-[#f0faf6] transition-colors"
                          aria-label="Relog meal"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && (
            <div className="px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={openUpload}
                className="text-sm text-[#24a17b] font-medium hover:underline"
              >
                Log another meal
              </button>
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            {dateRange === "today" ? "Today's macros" : "Macros"}
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Loading…</p>
          ) : (
            <MacroRings nutrients={macros} />
          )}
        </section>
      </div>
    </AppShell>
  );
}
