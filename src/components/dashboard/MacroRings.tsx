import Svg, { Circle } from "react-native-svg";
import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

const MACROS = [
  { key: "protein", label: "P", color: colors.brand, track: "#d4ede4" },
  { key: "carbs", label: "C", color: colors.yellow, track: "#fef3c7" },
  { key: "fat", label: "F", color: colors.orange, track: "#ffedd5" },
  { key: "sugar", label: "S", color: colors.cyan, track: "#cffafe" },
] as const;

function Ring({
  label,
  value,
  color,
  track,
}: {
  label: string;
  value: number;
  color: string;
  track: string;
}) {
  const pct = Math.min(value, 100);
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      <View style={{ width: 72, height: 72 }}>
        <Svg width={72} height={72} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={36} cy={36} r={r} fill="none" stroke={track} strokeWidth={6} />
          <Circle
            cx={36}
            cy={36}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <Text
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            textAlign: "center",
            textAlignVertical: "center",
            fontSize: 14,
            fontWeight: "700",
            color: "#374151",
            lineHeight: 72,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
        {value}g
      </Text>
    </View>
  );
}

export default function MacroRings({
  nutrients = {},
}: {
  nutrients?: Record<string, number>;
}) {
  const values = {
    protein: Math.round(nutrients.protein || 0),
    carbs: Math.round(nutrients.carbs || 0),
    fat: Math.round(nutrients.fat || 0),
    sugar: Math.round(nutrients.sugar || 0),
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
      {MACROS.map(({ key, label, color, track }) => (
        <Ring
          key={key}
          label={label}
          value={values[key]}
          color={color}
          track={track}
        />
      ))}
    </View>
  );
}
