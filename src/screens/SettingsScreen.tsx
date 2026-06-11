import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppDispatch } from "@/store";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AppShell from "@/components/layout/AppShell";
import Toggle from "@/components/ui/Toggle";
import { Card, PageTitle } from "@/components/ui/Common";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/settingsStorage";
import { logout } from "@/slices/authSlice";
import { colors } from "@/theme/colors";

function SettingsCard({
  title,
  children,
  danger,
}: {
  title?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Card style={{ padding: 0, overflow: "hidden", borderColor: danger ? "#fecaca" : colors.border }}>
      {title ? (
        <Text
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            fontSize: 11,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: danger ? colors.danger : colors.textMuted,
            borderBottomWidth: 1,
            borderBottomColor: danger ? "#fecaca" : "#f3f4f6",
            backgroundColor: danger ? colors.dangerBg : "transparent",
          }}
        >
          {title}
        </Text>
      ) : null}
      <View style={{ paddingHorizontal: 20 }}>{children}</View>
    </Card>
  );
}

function RowButton({
  label,
  description,
  buttonLabel,
  onPress,
  variant = "default",
}: {
  label: string;
  description?: string;
  buttonLabel: string;
  onPress: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{label}</Text>
        {description ? (
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{description}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={onPress}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: variant === "danger" ? "#fca5a5" : colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: variant === "danger" ? colors.danger : colors.text,
          }}
        >
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function SelectRow({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <View
      style={{
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        gap: 12,
      }}
    >
      <View>
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{label}</Text>
        {description ? (
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{description}</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: value === opt.value ? colors.brand : colors.border,
              backgroundColor: value === opt.value ? colors.mint : colors.cardBg,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: value === opt.value ? colors.brandDarker : colors.textMuted,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const SYNC_OPTIONS = [
  { value: "1h", label: "Every hour" },
  { value: "6h", label: "Every 6 hours" },
  { value: "12h", label: "Every 12 hours" },
  { value: "24h", label: "Once daily" },
];

const UNIT_OPTIONS = [
  { value: "metric", label: "Metric (kg, km)" },
  { value: "imperial", label: "Imperial (lb, mi)" },
];

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const update = async (partial: Partial<AppSettings>) => {
    const next = await saveSettings(partial);
    setSettings(next);
  };

  const handleSignOut = () => {
    dispatch(logout());
    router.replace("/login");
    Toast.show({ type: "info", text1: "Signed out" });
  };

  if (!settings) {
    return (
      <AppShell>
        <View style={{ padding: 24 }}>
          <PageTitle title="Settings" subtitle="Loading preferences…" />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ padding: 24, maxWidth: 672, alignSelf: "center", width: "100%", gap: 24 }}>
        <PageTitle title="Settings" subtitle="App preferences and account management" />

        <SettingsCard title="Notifications">
          <Toggle
            label="Daily meal reminder"
            description="Nudge to log meals each day"
            value={settings.dailyMealReminder}
            onValueChange={(v) => update({ dailyMealReminder: v })}
          />
          <Toggle
            label="Step goal reached"
            description="Celebrate when you hit 8,000 steps"
            value={settings.stepGoalReached}
            onValueChange={(v) => update({ stepGoalReached: v })}
          />
          <Toggle
            label="Streak alerts"
            description="Remind before your streak breaks"
            value={settings.streakAlerts}
            onValueChange={(v) => update({ streakAlerts: v })}
          />
          <Toggle
            label="Weekly summary"
            description="Email digest every Sunday"
            value={settings.weeklySummary}
            onValueChange={(v) => update({ weeklySummary: v })}
          />
        </SettingsCard>

        <SettingsCard title="Health data sync">
          <Toggle
            label="Apple Health"
            description="Sync steps via HealthKit"
            value={settings.appleHealth}
            onValueChange={(v) => update({ appleHealth: v })}
          />
          <Toggle
            label="Google Health Connect"
            description="Sync steps via Health Connect"
            value={settings.googleHealth}
            onValueChange={(v) => update({ googleHealth: v })}
          />
          <SelectRow
            label="Auto-sync frequency"
            description="How often to pull step data"
            value={settings.syncFrequency}
            options={SYNC_OPTIONS}
            onChange={(v) => update({ syncFrequency: v })}
          />
        </SettingsCard>

        <SettingsCard title="Display">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>Calorie goal</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Daily calorie target shown on dashboard
              </Text>
            </View>
            <TextInput
              value={String(settings.calorieGoal)}
              onChangeText={(v) => update({ calorieGoal: Number(v) || 2500 })}
              keyboardType="numeric"
              style={{
                width: 80,
                textAlign: "right",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 14,
              }}
            />
          </View>
          <SelectRow
            label="Units"
            description="Weight and distance units"
            value={settings.units}
            options={UNIT_OPTIONS}
            onChange={(v) => update({ units: v })}
          />
          <Toggle
            label="Show exercise recommendations"
            description="Steps/km to burn off meals"
            value={settings.showExerciseRec}
            onValueChange={(v) => update({ showExerciseRec: v })}
          />
        </SettingsCard>

        <SettingsCard title="Security">
          <RowButton
            label="Change password"
            description="Update your login credentials"
            buttonLabel="Update"
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Password change will be available in a future update",
              })
            }
          />
          <RowButton
            label="Session token"
            description="Secured with Firebase Authentication"
            buttonLabel="Sign out"
            onPress={handleSignOut}
          />
        </SettingsCard>

        <SettingsCard title="Danger zone" danger>
          <Pressable
            onPress={() => Toast.show({ type: "info", text1: "Export started — check your email" })}
            style={{
              marginVertical: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>Export my data</Text>
          </Pressable>
          <Pressable
            onPress={() => setDeleteWarningOpen((o) => !o)}
            style={{
              marginBottom: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#fecaca",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.danger }}>Delete my account</Text>
          </Pressable>
          {deleteWarningOpen ? (
            <View
              style={{
                marginBottom: 16,
                padding: 16,
                borderRadius: 8,
                backgroundColor: colors.dangerBg,
                borderWidth: 1,
                borderColor: "#fecaca",
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.danger }}>
                This permanently deletes your account, meals, and activity data. This cannot be undone.
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setDeleteWarningOpen(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#fca5a5",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "500", color: colors.danger }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Toast.show({
                      type: "error",
                      text1: "Account deletion requires backend support — contact support",
                    });
                    setDeleteWarningOpen(false);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.danger,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "500", color: "#fff" }}>Yes, delete everything</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </SettingsCard>
      </ScrollView>
    </AppShell>
  );
}
