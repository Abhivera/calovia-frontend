import { Pressable, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.cardBg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.brandDark : colors.brand,
        opacity: disabled || loading ? 0.5 : 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
      })}
    >
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
        {loading ? "Please wait…" : label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
