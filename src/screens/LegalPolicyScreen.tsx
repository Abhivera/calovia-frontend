import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import CaloviaLogo from "@/components/layout/CaloviaLogo";
import { getPolicyBySlug, LEGAL_POLICIES } from "@/content/legal/policies";
import { LEGAL_META } from "@/content/legal/company";
import { colors } from "@/theme/colors";

const BRAND = colors.brandAlt;

type PolicySection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  paragraphsAfter?: string[];
};

function BulletList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <View style={{ marginTop: 12, gap: 8, paddingLeft: 8 }}>
      {items.map((item) => (
        <View key={item.slice(0, 48)} style={{ flexDirection: "row", gap: 8 }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>•</Text>
          <Text style={{ flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 22 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function PolicySections({ sections }: { sections: PolicySection[] }) {
  return (
    <View style={{ gap: 40 }}>
      {sections.map(({ title, paragraphs = [], list = [], paragraphsAfter = [] }) => (
        <View key={title}>
          <Text style={{ fontSize: 18, fontWeight: "500", color: colors.text, marginBottom: 12 }}>
            {title}
          </Text>
          {paragraphs.length > 0 ? (
            <View style={{ gap: 12 }}>
              {paragraphs.map((text) => (
                <Text key={text.slice(0, 48)} style={{ fontSize: 14, color: colors.textMuted, lineHeight: 22 }}>
                  {text}
                </Text>
              ))}
            </View>
          ) : null}
          <BulletList items={list} />
          {paragraphsAfter.length > 0 ? (
            <View style={{ gap: 12, marginTop: 12 }}>
              {paragraphsAfter.map((text) => (
                <Text key={text.slice(0, 48)} style={{ fontSize: 14, color: colors.textMuted, lineHeight: 22 }}>
                  {text}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function LegalScreenLayout({
  title,
  lastUpdated,
  currentSlug,
  children,
}: {
  title?: string;
  lastUpdated?: string;
  currentSlug?: string;
  children: React.ReactNode;
}) {
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
          <Link href="/legal">
            <Text style={{ fontSize: 12, color: colors.textLight }}>Legal</Text>
          </Link>
          {title ? (
            <>
              <ChevronRight size={14} color={colors.textLight} />
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{title}</Text>
            </>
          ) : null}
        </View>

        <View>
          <View style={{ minWidth: 0 }}>
            {title ? (
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 28, fontWeight: "500", color: colors.text, marginBottom: 8 }}>
                  {title}
                </Text>
                {lastUpdated ? (
                  <Text style={{ fontSize: 14, color: colors.textLight }}>Last updated: {lastUpdated}</Text>
                ) : null}
              </View>
            ) : null}
            {children}
          </View>
        </View>
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
                <Text
                  style={{
                    fontSize: 12,
                    color: slug === currentSlug ? BRAND : colors.textLight,
                    fontWeight: slug === currentSlug ? "600" : "400",
                  }}
                >
                  {label}
                </Text>
              </Link>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function LegalPolicyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const policy = getPolicyBySlug(slug);

  useEffect(() => {
    if (slug && !policy) {
      router.replace("/legal");
    }
  }, [slug, policy, router]);

  if (!policy) {
    return null;
  }

  return (
    <LegalScreenLayout title={policy.label} lastUpdated={policy.lastUpdated} currentSlug={policy.slug}>
      <PolicySections sections={policy.sections} />

      <View
        style={{
          marginTop: 40,
          paddingTop: 32,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 2,
            color: BRAND,
            marginBottom: 12,
          }}
        >
          Other policies
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {LEGAL_POLICIES.filter((p) => p.slug !== policy.slug).map(({ slug: s, label }) => (
            <Link key={s} href={`/legal/${s}`} asChild>
              <Pressable
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{label}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </LegalScreenLayout>
  );
}
