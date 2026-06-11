import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export default function Toggle({
  value,
  onValueChange,
  label,
  description,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        gap: 16,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
          {label}
        </Text>
        {description ? (
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: value ? colors.brand : "#d1d5db",
          justifyContent: "center",
          paddingHorizontal: 3,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "#fff",
            alignSelf: value ? "flex-end" : "flex-start",
          }}
        />
      </Pressable>
    </View>
  );
}
