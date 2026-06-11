import { Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";

export default function NotFoundScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: colors.pageBg,
      }}
    >
      <Text style={{ fontSize: 20, color: colors.danger, fontWeight: "600", marginBottom: 16 }}>
        404 - Page Not Found
      </Text>
      <Link href="/" style={{ color: colors.brand, fontSize: 14 }}>
        Go to home
      </Link>
    </View>
  );
}
