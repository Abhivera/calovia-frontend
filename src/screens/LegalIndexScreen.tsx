import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import CaloviaLogo from "@/components/layout/CaloviaLogo";
import { LEGAL_POLICIES } from "@/content/legal/policies";
import { LEGAL_META } from "@/content/legal/company";
import { colors } from "@/theme/colors";

const BRAND = colors.brandAlt;

function LegalScreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cardBg }}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            maxWidth: 1024,
            alignSelf: "center",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <CaloviaLogo href="/" />
          <Link href="/" asChild>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <ArrowLeft size={16} color={colors.textMuted} />
              <Text style={{ fontSize: 14, color: colors.textMuted }}>Back to home</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          maxWidth: 1024,
          alignSelf: "center",
          width: "100%",
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
      >
        {children}
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
      >
        <View style={{ maxWidth: 1024, alignSelf: "center", width: "100%", gap: 12 }}>
          <Text style={{ fontSize: 12, color: colors.textLight, textAlign: "center" }}>
            © 2026 {LEGAL_META.companyName}. All rights reserved.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {LEGAL_POLICIES.map(({ slug, label }) => (
              <Link key={slug} href={`/legal/${slug}`}>
                <Text style={{ fontSize: 12, color: colors.textLight }}>{label}</Text>
              </Link>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function LegalIndexScreen() {
  return (
    <LegalScreenLayout>
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 28, fontWeight: "500", color: colors.text, marginBottom: 8 }}>Legal</Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, lineHeight: 22, maxWidth: 640 }}>
          Policies and legal information for {LEGAL_META.productName} — {LEGAL_META.tagline}. These documents
          explain how we handle your data, what you agree to when using the service, and your rights as a user
          in India and elsewhere.
        </Text>
      </View>

      <View
        style={{
          marginBottom: 32,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.mintLight,
          backgroundColor: `${colors.mintLight}66`,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.mintDark, lineHeight: 22 }}>
          <Text style={{ fontWeight: "600" }}>Quick summary: </Text>
          Calovia uses AI to estimate nutrition from meal photos. We use Firebase for sign-in, do not show ads,
          and do not sell your data. Pro costs ₹{LEGAL_META.proPriceInr}/month after an optional{" "}
          {LEGAL_META.proTrialMonths}-month trial. The public analyser allows {LEGAL_META.freeAnalyzeLimit} free
          analyses per day without an account.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {LEGAL_POLICIES.map(({ slug, label, summary, lastUpdated }) => (
          <Link key={slug} href={`/legal/${slug}`} asChild>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "500", color: colors.text }}>{label}</Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 20 }}>
                  {summary}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textLight, marginTop: 8 }}>
                  Updated {lastUpdated}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} style={{ marginTop: 2 }} />
            </Pressable>
          </Link>
        ))}
      </View>

      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 32, lineHeight: 22 }}>
        Questions? Email{" "}
        <Text
          style={{ fontWeight: "500", color: BRAND }}
          onPress={() => Linking.openURL(`mailto:${LEGAL_META.legalEmail}`)}
        >
          {LEGAL_META.legalEmail}
        </Text>{" "}
        or{" "}
        <Text
          style={{ fontWeight: "500", color: BRAND }}
          onPress={() => Linking.openURL(`mailto:${LEGAL_META.supportEmail}`)}
        >
          {LEGAL_META.supportEmail}
        </Text>
      </Text>
    </LegalScreenLayout>
  );
}
