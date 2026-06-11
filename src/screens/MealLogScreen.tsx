import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { RefreshCw, Trash2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AppShell from "@/components/layout/AppShell";
import MacroRings from "@/components/dashboard/MacroRings";
import MealAnalysisResult from "@/components/meal/MealAnalysisResult";
import PillButton from "@/components/ui/PillButton";
import { Card } from "@/components/ui/Common";
import {
  deleteImage,
  getAllImages,
  relogImage,
  updateImageIsMeal,
  uploadAndAnalyzeImage,
} from "@/api/images";
import { getMealSummary } from "@/api/meal";
import {
  formatLongDate,
  formatNumber,
  formatTime,
  mealPeriodParams,
} from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { assetToUploadFile, pickImage } from "@/lib/imagePicker";
import { colors } from "@/theme/colors";

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

type MealImage = {
  id: string;
  file_url?: string;
  original_filename?: string;
  created_at?: string;
  analysis?: {
    is_food?: boolean;
    is_meal?: boolean;
    meal_name?: string;
    calories?: number;
    food_items?: string[];
    nutrients?: Record<string, number>;
    exercise_recommendations?: { steps?: number };
  };
};

function aggregateMacros(meals: MealImage[]) {
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

function isSnack(meal: MealImage) {
  const a = meal.analysis;
  return a?.is_food && a?.is_meal === false;
}

function isMealEntry(meal: MealImage) {
  return meal.analysis?.is_meal === true;
}

function filterMealsList(meals: MealImage[], listFilter: string) {
  if (listFilter === "meals") return meals.filter(isMealEntry);
  if (listFilter === "snacks") return meals.filter(isSnack);
  return meals.filter((m) => m.analysis?.is_food);
}

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

export default function MealLogScreen() {
  const [meals, setMeals] = useState<MealImage[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");
  const [listFilter, setListFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingImage, setPendingImage] = useState<MealImage | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<MealImage["analysis"] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = mealPeriodParams(dateRange);
    try {
      const [imagesRes, summaryRes] = await Promise.all([
        getAllImages({ ...params, limit: 100 }),
        getMealSummary(params).catch(() => null),
      ]);
      const list = ((imagesRes.images || []) as MealImage[]).filter(
        (img) => img.analysis?.is_food
      );
      setMeals(list);
      setSummary(summaryRes);
    } catch {
      Toast.show({ type: "error", text1: "Could not load meals" });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedMeals = filterMealsList(meals, listFilter);
  const mealCount = (summary?.total_meals as number) ?? meals.filter(isMealEntry).length;
  const totalCalories =
    (summary?.total_calories as number) ??
    meals.filter(isMealEntry).reduce((s, m) => s + (m.analysis?.calories || 0), 0);
  const totalExerciseSteps =
    (summary?.total_exercise as { steps?: number })?.steps ??
    meals
      .filter(isMealEntry)
      .reduce((s, m) => s + (m.analysis?.exercise_recommendations?.steps || 0), 0);
  const macros = aggregateMacros(meals.filter((m) => m.analysis?.is_meal));

  const clearPending = () => {
    setPreviewUrl(null);
    setPendingImage(null);
    setPendingAnalysis(null);
  };

  const handlePick = async () => {
    const asset = await pickImage();
    if (!asset) return;

    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
      Toast.show({ type: "error", text1: "Image must be under 10 MB" });
      return;
    }

    setPreviewUrl(asset.uri);
    setAnalyzing(true);
    setPendingImage(null);
    setPendingAnalysis(null);

    try {
      const file = assetToUploadFile(asset);
      const res = await uploadAndAnalyzeImage(file);
      if (res?.image?.analysis) {
        setPendingImage(res.image);
        setPendingAnalysis(res.image.analysis);
      } else {
        Toast.show({ type: "error", text1: "Analysis completed but no nutrition data was returned" });
        clearPending();
      }
    } catch (err) {
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
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
      Toast.show({ type: "success", text1: "Meal saved" });
      await loadData();
      clearPending();
      setShowUpload(false);
    } catch (err) {
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
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
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
      return;
    }
    clearPending();
    setShowUpload(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setSummary((prev) =>
        prev
          ? { ...prev, total_meals: Math.max(0, ((prev.total_meals as number) ?? 1) - 1) }
          : prev
      );
      await loadData();
      Toast.show({ type: "success", text1: "Meal removed" });
    } catch (err) {
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
    }
  };

  const handleRelog = async (id: string) => {
    try {
      const res = await relogImage(id);
      if (res?.image) {
        await loadData();
        Toast.show({ type: "success", text1: "Meal logged again" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
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
      <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 896, alignSelf: "center", width: "100%", gap: 24 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <View style={{ flex: 1, minWidth: 200 }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Meal log</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              {formatLongDate(new Date())}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {DATE_RANGES.map(({ id, label }) => (
                <PillButton
                  key={id}
                  label={label}
                  active={dateRange === id}
                  onPress={() => setDateRange(id)}
                />
              ))}
            </View>
          </View>
          <Pressable
            onPress={() => setShowUpload(true)}
            style={{
              backgroundColor: colors.brand,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Log meal</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          <SummaryCard title="Meals logged">
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
              {loading ? "—" : mealCount}
            </Text>
          </SummaryCard>
          <SummaryCard title="Total calories">
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.brand }}>
              {loading ? "—" : formatNumber(totalCalories)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              of {formatNumber(CALORIE_GOAL)} goal
            </Text>
          </SummaryCard>
          <SummaryCard title="Total exercise rec.">
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
              {loading ? "—" : formatNumber(totalExerciseSteps)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>steps suggested</Text>
          </SummaryCard>
        </View>

        {showUpload ? (
          <View style={{ gap: 16 }}>
            {!pendingAnalysis && !analyzing ? (
              <Pressable onPress={handlePick}>
                <Card style={{ alignItems: "center", paddingVertical: 40, borderStyle: "dashed" }}>
                  <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 4 }}>
                    Take or upload a photo of your meal
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 20, textAlign: "center" }}>
                    Our AI will detect food items and estimate calories
                  </Text>
                  <View style={{ backgroundColor: colors.brand, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 }}>
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Choose photo</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 16 }}>JPEG, PNG · max 10 MB</Text>
                </Card>
              </Pressable>
            ) : null}

            {analyzing ? (
              <Card style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
                {previewUrl ? (
                  <Image source={{ uri: previewUrl }} style={{ width: 160, height: 160, borderRadius: 8 }} />
                ) : null}
                <ActivityIndicator size="large" color={colors.brand} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.textMuted }}>
                  Analyzing your meal…
                </Text>
              </Card>
            ) : null}

            {pendingAnalysis && !analyzing ? (
              <View style={{ gap: 12 }}>
                {previewUrl ? (
                  <Image
                    source={{ uri: previewUrl }}
                    style={{ width: "100%", height: 192, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                ) : null}
                {pendingAnalysis.meal_name ? (
                  <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, paddingHorizontal: 4 }}>
                    {pendingAnalysis.meal_name}
                  </Text>
                ) : null}
                <MealAnalysisResult
                  analysis={pendingAnalysis}
                  onSave={handleSaveMeal}
                  onDiscard={handleDiscard}
                  saving={saving}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Text style={{ fontWeight: "600", color: colors.text }}>{mealsSectionTitle}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {LIST_FILTERS.map(({ id, label }) => (
                <PillButton
                  key={id}
                  label={label}
                  active={listFilter === id}
                  onPress={() => setListFilter(id)}
                />
              ))}
            </View>
          </View>

          {loading ? (
            <Text style={{ padding: 24, textAlign: "center", color: colors.textMuted, fontSize: 14 }}>
              Loading…
            </Text>
          ) : displayedMeals.length === 0 ? (
            <Text style={{ padding: 24, textAlign: "center", color: colors.textMuted, fontSize: 14 }}>
              No meals in this period.
            </Text>
          ) : (
            displayedMeals.map((meal, idx) => {
              const n = meal.analysis?.nutrients || {};
              return (
                <View
                  key={meal.id}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderTopWidth: idx > 0 ? 1 : 0,
                    borderTopColor: "#f3f4f6",
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        backgroundColor: colors.mint,
                        overflow: "hidden",
                      }}
                    >
                      {meal.file_url ? (
                        <Image source={{ uri: meal.file_url }} style={{ width: 56, height: 56 }} />
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "600", color: colors.text }}>
                            {meal.analysis?.meal_name || meal.original_filename}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
                            {formatTime(meal.created_at)}
                          </Text>
                        </View>
                        <Text style={{ fontWeight: "700", fontSize: 14, color: colors.text }}>
                          {formatNumber(meal.analysis?.calories)} kcal
                        </Text>
                      </View>
                      {(meal.analysis?.food_items?.length ?? 0) > 0 ? (
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }} numberOfLines={2}>
                          {meal.analysis?.food_items?.join(", ")}
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>
                          Protein <Text style={{ fontWeight: "600", color: colors.text }}>{n.protein ?? 0}g</Text>
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>
                          Carbs <Text style={{ fontWeight: "600", color: colors.text }}>{n.carbs ?? 0}g</Text>
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>
                          Fat <Text style={{ fontWeight: "600", color: colors.text }}>{n.fat ?? 0}g</Text>
                        </Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      <Pressable
                        onPress={() => handleDelete(meal.id)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                        }}
                        accessibilityLabel="Delete meal"
                      >
                        <Trash2 size={16} color={colors.textMuted} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleRelog(meal.id)}
                        style={{
                          padding: 8,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                        }}
                        accessibilityLabel="Relog meal"
                      >
                        <RefreshCw size={16} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {!loading ? (
            <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#f3f4f6" }}>
              <Pressable onPress={() => setShowUpload(true)}>
                <Text style={{ fontSize: 14, color: colors.brand, fontWeight: "500" }}>Log another meal</Text>
              </Pressable>
            </View>
          ) : null}
        </Card>

        <Card>
          <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 16 }}>
            {dateRange === "today" ? "Today's macros" : "Macros"}
          </Text>
          {loading ? (
            <Text style={{ textAlign: "center", color: colors.textMuted, paddingVertical: 16 }}>Loading…</Text>
          ) : (
            <MacroRings nutrients={macros} />
          )}
        </Card>
      </ScrollView>
    </AppShell>
  );
}
