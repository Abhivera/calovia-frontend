import { Pressable, Text, View } from "react-native";
import { formatNumber } from "@/lib/format";
import { colors } from "@/theme/colors";

interface Analysis {
  food_items?: string[];
  description?: string;
  calories?: number;
  nutrients?: Record<string, number>;
  exercise_recommendations?: { steps?: number; walking_km?: number };
}

export default function MealAnalysisResult({
  analysis,
  onSave,
  onDiscard,
  saving = false,
}: {
  analysis?: Analysis | null;
  onSave?: () => void;
  onDiscard?: () => void;
  saving?: boolean;
}) {
  if (!analysis) return null;

  const nutrients = analysis.nutrients || {};
  const exercise = analysis.exercise_recommendations;

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 20,
        gap: 16,
      }}
    >
      {analysis.food_items && analysis.food_items.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {analysis.food_items.map((item) => (
            <View
              key={item}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: colors.mint,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: colors.brandDarker }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {analysis.description ? (
        <Text style={{ fontSize: 14, color: colors.textMuted }}>{analysis.description}</Text>
      ) : null}

      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <Text style={{ fontSize: 36, fontWeight: "700", color: colors.text }}>
          {formatNumber(analysis.calories ?? 0)}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textMuted }}>calories</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          ["Protein", nutrients.protein, colors.brand],
          ["Carbs", nutrients.carbs, colors.yellow],
          ["Fat", nutrients.fat, colors.orange],
          ["Sugar", nutrients.sugar, colors.cyan],
        ].map(([label, val, color]) => (
          <View
            key={label as string}
            style={{
              flex: 1,
              alignItems: "center",
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#f9fafb",
              borderWidth: 1,
              borderColor: "#f3f4f6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: color as string }}>
              {val ?? 0}g
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{label}</Text>
          </View>
        ))}
      </View>

      {exercise ? (
        <View
          style={{
            borderRadius: 8,
            backgroundColor: colors.exerciseBg,
            borderWidth: 1,
            borderColor: colors.exerciseBorder,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: colors.textMuted,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Exercise to burn
          </Text>
          <View style={{ flexDirection: "row", gap: 32 }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: "700", color: colors.brand }}>
                {formatNumber(exercise.steps ?? 0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>steps</Text>
            </View>
            <View>
              <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
                {exercise.walking_km} km
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>walking</Text>
            </View>
          </View>
        </View>
      ) : null}

      {(onSave || onDiscard) && (
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 4 }}>
          {onDiscard ? (
            <Pressable
              onPress={onDiscard}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 14, color: colors.text }}>
                Discard
              </Text>
            </Pressable>
          ) : null}
          {onSave ? (
            <Pressable
              onPress={onSave}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.brand,
                alignItems: "center",
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 14, color: "#fff" }}>
                {saving ? "Saving…" : "Save meal"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
