import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import { Camera } from "lucide-react-native";
import Toast from "react-native-toast-message";
import CaloviaLogo from "@/components/layout/CaloviaLogo";
import MealAnalysisResult from "@/components/meal/MealAnalysisResult";
import { Card } from "@/components/ui/Common";
import { publicAnalyzeFood } from "@/api/images";
import { assetToUploadFile, pickImage } from "@/lib/imagePicker";
import { colors } from "@/theme/colors";

const BRAND = colors.brandAlt;

const FEATURES = [
  { title: "AI meal analysis", desc: "Snap a photo and get calories, macros, and food items in seconds." },
  { title: "Step tracking", desc: "Set goals and track daily distance and calories burned from steps." },
  { title: "Activity logging", desc: "Log runs, yoga, cycling and more with calorie estimates." },
  { title: "Progress charts", desc: "Weekly and monthly trends for calories, macros, weight, and steps." },
  { title: "Streak system", desc: "Build a habit — your streak grows every day you log a meal." },
  { title: "Private & secure", desc: "Firebase auth and no ads. Your data is yours." },
];

export default function NonUserHomeScreen() {
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining_requests?: number; limit?: number; period?: string } | null>(null);

  const handlePick = async () => {
    const asset = await pickImage();
    if (!asset) return;

    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
      Toast.show({ type: "error", text1: "Image must be under 10 MB" });
      return;
    }

    setPreviewUrl(asset.uri);
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const file = assetToUploadFile(asset);
      const result = await publicAnalyzeFood(file);
      setAnalysis(result.analysis as Record<string, unknown>);
      if (result.rate_limit) setRateLimit(result.rate_limit);
    } catch (e) {
      Toast.show({ type: "error", text1: (e as Error).message || "Analysis failed" });
      setPreviewUrl(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setPreviewUrl(null);
    setRateLimit(null);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.pageBg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: colors.cardBg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <CaloviaLogo href="/" />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Link href="/login" asChild>
            <Pressable style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <Text style={{ fontWeight: "500", color: colors.textMuted }}>Sign in</Text>
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable
              style={{
                backgroundColor: colors.brand,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "600", color: "#fff" }}>Get started</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={{ padding: 24, maxWidth: 1152, alignSelf: "center", width: "100%", gap: 48 }}>
        <View style={{ alignItems: "center", gap: 16 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: colors.text,
              textAlign: "center",
              lineHeight: 44,
            }}
          >
            Track nutrition with AI-powered meal photos
          </Text>
          <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: "center", maxWidth: 560 }}>
            Calovia analyzes your meals, syncs steps, and shows net calories — built for Indian diets.
          </Text>
          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/register" asChild>
              <Pressable
                style={{
                  backgroundColor: colors.brand,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Start free</Text>
              </Pressable>
            </Link>
            <Pressable
              onPress={handlePick}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.cardBg,
              }}
            >
              <Text style={{ fontWeight: "600", color: colors.text }}>Try meal analyzer</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, textAlign: "center" }}>
            Try it now — no account needed
          </Text>
          {analyzing ? (
            <Card style={{ alignItems: "center", paddingVertical: 40, gap: 12 }}>
              {previewUrl ? (
                <Image source={{ uri: previewUrl }} style={{ width: 160, height: 160, borderRadius: 8 }} />
              ) : null}
              <ActivityIndicator size="large" color={BRAND} />
              <Text style={{ color: colors.textMuted }}>Analyzing…</Text>
            </Card>
          ) : analysis ? (
            <View style={{ gap: 16 }}>
              {previewUrl ? (
                <Image source={{ uri: previewUrl }} style={{ width: "100%", height: 200, borderRadius: 12 }} resizeMode="cover" />
              ) : null}
              <MealAnalysisResult analysis={analysis as never} />
              {rateLimit ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
                  {rateLimit.remaining_requests} analyses left today ({rateLimit.limit}/{rateLimit.period})
                </Text>
              ) : null}
              <Pressable onPress={reset}>
                <Text style={{ textAlign: "center", color: colors.textMuted, fontSize: 14 }}>Try another photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={handlePick}>
              <Card style={{ alignItems: "center", paddingVertical: 40, borderStyle: "dashed" }}>
                <Camera size={40} color={BRAND} />
                <Text style={{ fontSize: 18, fontWeight: "500", color: colors.text, marginTop: 12 }}>
                  Upload a meal photo
                </Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: "center" }}>
                  Our AI will detect food items and estimate calories — no account needed
                </Text>
                <View
                  style={{
                    backgroundColor: BRAND,
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                    borderRadius: 8,
                    marginTop: 20,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "500" }}>Choose photo</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 16 }}>JPEG, PNG · max 10 MB</Text>
              </Card>
            </Pressable>
          )}
        </View>

        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text, textAlign: "center" }}>
            Everything you need to eat smarter
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {FEATURES.map((f) => (
              <Card key={f.title} style={{ flex: 1, minWidth: 240 }}>
                <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 8 }}>{f.title}</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, lineHeight: 20 }}>{f.desc}</Text>
              </Card>
            ))}
          </View>
        </View>

        <Card style={{ alignItems: "center", backgroundColor: colors.mintLight, borderColor: colors.mint }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
            Ready to track your nutrition?
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 20, textAlign: "center" }}>
            Free to start. Upgrade when you need more.
          </Text>
          <Link href="/register" asChild>
            <Pressable
              style={{
                backgroundColor: colors.brand,
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Create free account</Text>
            </Pressable>
          </Link>
        </Card>

        <View style={{ paddingBottom: 32, alignItems: "center", gap: 8 }}>
          <Link href="/legal">
            <Text style={{ color: colors.brand, fontSize: 14 }}>Legal & policies</Text>
          </Link>
          <Text style={{ fontSize: 12, color: colors.textLight }}>© {new Date().getFullYear()} Calovia</Text>
        </View>
      </View>
    </ScrollView>
  );
}
