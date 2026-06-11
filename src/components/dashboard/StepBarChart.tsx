import { Text, View } from "react-native";
import { formatNumber } from "@/lib/format";
import { colors } from "@/theme/colors";

export default function StepBarChart({
  days = [],
  stepGoal = 8000,
}: {
  days?: { date: string; steps: number }[];
  stepGoal?: number;
}) {
  const maxSteps = Math.max(stepGoal, ...days.map((d) => d.steps || 0), 1);

  const chartHeight = 100;

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
      {days.map((day) => {
        const pct = (day.steps || 0) / maxSteps;
        const barHeight = Math.max(pct * chartHeight, 4);
        const hitGoal = (day.steps || 0) >= stepGoal;
        const label = new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "short",
        });
        return (
          <View key={day.date} style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <View style={{ height: chartHeight, justifyContent: "flex-end", width: "100%" }}>
              <View
                style={{
                  width: "100%",
                  height: barHeight,
                  backgroundColor: hitGoal ? colors.brand : "#d1d5db",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ fontSize: 10, color: colors.textMuted }}>{label}</Text>
            <Text style={{ fontSize: 10, fontWeight: "600", color: colors.text }}>
              {formatNumber(day.steps || 0)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
