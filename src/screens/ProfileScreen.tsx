import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/store";
import { Camera, Flame } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AppShell from "@/components/layout/AppShell";
import PillButton from "@/components/ui/PillButton";
import { Card } from "@/components/ui/Common";
import * as userApi from "@/api/user";
import { getMealSummary } from "@/api/meal";
import { getStreak } from "@/api/user";
import { getCurrentUser } from "@/slices/authSlice";
import { calculateBmi, getBmiStatus } from "@/lib/bmi";
import { formatNumber, getInitials } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiErrors";
import { assetToUploadFile, pickImage } from "@/lib/imagePicker";
import type { User } from "@/types/user";
import { colors } from "@/theme/colors";

type ProfileForm = {
  full_name: string;
  email: string;
  gender: string;
  age: string | number;
  weight: string | number;
  height: string | number;
  goal_weight: string | number;
  step_goal: number;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: colors.text,
};

const GENDERS = [
  { value: "", label: "—" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);

  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<Record<string, number> | null>(null);
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    goal_weight: "",
    step_goal: 8000,
  });
  const [initial, setInitial] = useState<ProfileForm | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [userData, streakData, meals] = await Promise.all([
          userApi.getUser(),
          getStreak().catch(() => null),
          getMealSummary().catch(() => null),
        ]);
        setUser(userData);
        setStreak(streakData);
        setMealCount((meals?.total_meals as number) ?? (meals?.meals as unknown[])?.length ?? 0);
        const f: ProfileForm = {
          full_name: userData.full_name || "",
          email: userData.email || "",
          gender: userData.gender || "",
          age: userData.age ?? "",
          weight: userData.weight ?? "",
          height: userData.height ?? "",
          goal_weight: userData.goal_weight ?? "",
          step_goal: userData.step_goal ?? 8000,
        };
        setForm(f);
        setInitial(f);
      } catch {
        Toast.show({ type: "error", text1: "Could not load profile" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const dirty = useMemo(() => {
    if (!initial) return false;
    return JSON.stringify(form) !== JSON.stringify(initial);
  }, [form, initial]);

  const bmi = calculateBmi(
    form.weight === "" ? null : Number(form.weight),
    form.height === "" ? null : Number(form.height)
  );
  const bmiStatus = getBmiStatus(bmi);

  const handleSave = async () => {
    setSaving(true);
    try {
      const profilePayload = {
        full_name: form.full_name || undefined,
        gender: form.gender || null,
        age: form.age === "" ? null : Number(form.age),
        weight: form.weight === "" ? null : Number(form.weight),
        height: form.height === "" ? null : Number(form.height),
        goal_weight: form.goal_weight === "" ? null : Number(form.goal_weight),
      };
      let updated = await userApi.updateUser(profilePayload);
      const stepGoal = Number(form.step_goal) || 8000;
      if (initial && Number(initial.step_goal) !== stepGoal) {
        updated = await userApi.updateStepGoal(stepGoal);
      }
      setUser(updated);
      setInitial({ ...form });
      dispatch(getCurrentUser());
      Toast.show({ type: "success", text1: "Profile saved" });
    } catch (err) {
      Toast.show({ type: "error", text1: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async () => {
    const asset = await pickImage();
    if (!asset) return;
    setAvatarUploading(true);
    try {
      const file = assetToUploadFile(asset);
      await userApi.uploadAvatar(file);
      const updated = await userApi.getUser();
      setUser(updated);
      dispatch(getCurrentUser());
      Toast.show({ type: "success", text1: "Photo updated" });
    } catch {
      Toast.show({ type: "error", text1: "Upload failed" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  if (loading) {
    return (
      <AppShell>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 768, alignSelf: "center", width: "100%", gap: 24 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Profile</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              Manage your personal info and goals
            </Text>
          </View>
          {dirty ? (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: colors.brand,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                opacity: saving ? 0.5 : 1,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                {saving ? "Saving…" : "Save changes"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Card style={{ gap: 24 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: colors.mint,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={{ width: 96, height: 96 }} />
                ) : (
                  <Text style={{ fontSize: 24, fontWeight: "700", color: colors.brand }}>
                    {getInitials(form.full_name, form.email)}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={handleAvatar}
                disabled={avatarUploading}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.brand,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: avatarUploading ? 0.5 : 1,
                }}
                accessibilityLabel="Upload photo"
              >
                {avatarUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Camera size={16} color="#fff" />
                )}
              </Pressable>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text }}>
                {form.full_name || "Your name"}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>{form.email}</Text>
              <View
                style={{
                  marginTop: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: colors.mint,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "500", color: colors.brandDarker }}>
                  Member since {memberSince}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Full name">
                <TextInput
                  value={String(form.full_name)}
                  onChangeText={(v) => setForm((p) => ({ ...p, full_name: v }))}
                  style={inputStyle}
                />
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Email">
                <TextInput
                  value={String(form.email)}
                  editable={false}
                  style={[inputStyle, { backgroundColor: "#f9fafb", color: colors.textMuted }]}
                />
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Gender">
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {GENDERS.filter((g) => g.value).map((g) => (
                    <PillButton
                      key={g.value}
                      label={g.label}
                      active={form.gender === g.value}
                      onPress={() => setForm((p) => ({ ...p, gender: g.value }))}
                    />
                  ))}
                </View>
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Age">
                <TextInput
                  value={String(form.age)}
                  onChangeText={(v) => setForm((p) => ({ ...p, age: v }))}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </Field>
            </View>
          </View>
        </Card>

        <Card style={{ gap: 16 }}>
          <Text style={{ fontWeight: "600", color: colors.text, fontSize: 16 }}>Body measurements</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Weight (kg)">
                <TextInput
                  value={String(form.weight)}
                  onChangeText={(v) => setForm((p) => ({ ...p, weight: v }))}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Height (cm)">
                <TextInput
                  value={String(form.height)}
                  onChangeText={(v) => setForm((p) => ({ ...p, height: v }))}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="Goal weight (kg)">
                <TextInput
                  value={String(form.goal_weight)}
                  onChangeText={(v) => setForm((p) => ({ ...p, goal_weight: v }))}
                  keyboardType="numeric"
                  style={inputStyle}
                />
              </Field>
            </View>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Field label="BMI">
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{bmi ?? "—"}</Text>
                  {bmi != null ? (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: colors.mint,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: bmiStatus.color }}>
                        {bmiStatus.label}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Field>
            </View>
          </View>
        </Card>

        <Card style={{ gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "600", color: colors.text, fontSize: 16 }}>Daily goals</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.brand }}>
              {formatNumber(form.step_goal)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => setForm((p) => ({ ...p, step_goal: Math.max(1000, p.step_goal - 500) }))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: colors.text }}>−</Text>
            </Pressable>
            <View style={{ flex: 1, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2 }}>
              <View
                style={{
                  height: "100%",
                  width: `${((form.step_goal - 1000) / 99000) * 100}%`,
                  backgroundColor: colors.brand,
                  borderRadius: 2,
                }}
              />
            </View>
            <Pressable
              onPress={() => setForm((p) => ({ ...p, step_goal: Math.min(100000, p.step_goal + 500) }))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: colors.text }}>+</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12, color: colors.textLight }}>1,000</Text>
            <Text style={{ fontSize: 12, color: colors.textLight }}>100,000</Text>
          </View>
        </Card>

        <Card>
          <Text style={{ fontWeight: "600", color: colors.text, marginBottom: 16 }}>Stats at a glance</Text>
          <View style={{ gap: 12 }}>
            {[
              {
                label: "Current streak",
                value: (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontWeight: "600", color: colors.text }}>
                      {streak?.current_streak ?? 0} days
                    </Text>
                    <Flame size={16} color={colors.orange} />
                  </View>
                ),
              },
              { label: "Longest streak", value: `${streak?.longest_streak ?? 0} days` },
              { label: "Total meals logged", value: String(mealCount) },
              {
                label: "Member since",
                value: user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              },
              { label: "Account role", value: user?.role || "user" },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>{row.label}</Text>
                {typeof row.value === "string" ? (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>{row.value}</Text>
                ) : (
                  row.value
                )}
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
