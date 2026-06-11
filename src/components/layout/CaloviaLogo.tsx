import { Image, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import { colors } from "@/theme/colors";

const logo = require("../../../assets/calovia-logo.png");

export default function CaloviaLogo({
  href = "/",
  showText = true,
  size = 80,
}: {
  href?: string;
  showText?: boolean;
  size?: number;
}) {
  const content = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image
        source={logo}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {showText ? (
        <Text style={{ fontWeight: "700", fontSize: 18, color: colors.text }}>
          Calovia
        </Text>
      ) : null}
    </View>
  );

  if (href) {
    return (
      <Link href={href as never} asChild>
        <Pressable>{content}</Pressable>
      </Link>
    );
  }

  return content;
}
