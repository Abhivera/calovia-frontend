import { Pressable, Text } from "react-native";
import { colors } from "@/theme/colors";

export default function PillButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? colors.mint : "#f3f4f6",
        borderWidth: 1,
        borderColor: active ? colors.brand : colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: active ? colors.brandDarker : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
