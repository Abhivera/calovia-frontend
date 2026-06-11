import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Link, usePathname } from "expo-router";
import {
  Activity,
  Footprints,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react-native";
import CaloviaLogo from "./CaloviaLogo";
import { logout } from "@/slices/authSlice";
import { getInitials } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store";
import { colors } from "@/theme/colors";

const MAIN_NAV = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/meal-log", label: "Log meal", icon: UtensilsCrossed },
  { path: "/activity", label: "Activity", icon: Activity },
  { path: "/progress", label: "Progress", icon: TrendingUp },
  { path: "/activity", label: "Steps", icon: Footprints, stepsOnly: true },
];

const ACCOUNT_NAV = [
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  path,
  label,
  icon: Icon,
  active,
  onPress,
}: {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onPress?: () => void;
}) {
  return (
    <Link href={path as never} asChild>
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: active ? colors.mint : "transparent",
        }}
      >
        <Icon size={16} color={active ? colors.brandDarker : colors.textMuted} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: active ? "600" : "500",
            color: active ? colors.brandDarker : colors.textMuted,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";

  const isActive = (path: string, stepsOnly?: boolean) => {
    if (stepsOnly) return pathname === "/activity";
    return path === "/" ? pathname === "/" : pathname === path;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cardBg }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
        <CaloviaLogo href="/" />
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: colors.textLight,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 8,
            paddingHorizontal: 12,
          }}
        >
          Main
        </Text>
        {MAIN_NAV.map((item) => (
          <NavItem
            key={`${item.path}-${item.label}`}
            path={item.stepsOnly ? "/activity" : item.path}
            label={item.label}
            icon={item.icon}
            active={isActive(item.path, item.stepsOnly)}
            onPress={onNavigate}
          />
        ))}

        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            color: colors.textLight,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginTop: 24,
            marginBottom: 8,
            paddingHorizontal: 12,
          }}
        >
          Account
        </Text>
        {ACCOUNT_NAV.map((item) => (
          <NavItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            active={isActive(item.path)}
            onPress={onNavigate}
          />
        ))}
      </ScrollView>

      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.mint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "600", color: colors.brand, fontSize: 13 }}>
            {getInitials(user?.full_name, user?.email)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <Pressable onPress={() => dispatch(logout())} accessibilityLabel="Log out">
          <LogOut size={18} color={colors.textLight} />
        </Pressable>
      </View>
    </View>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.pageBg }}>
      {isDesktop ? (
        <View
          style={{
            width: 224,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            backgroundColor: colors.cardBg,
          }}
        >
          <SidebarContent />
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        {!isDesktop ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.cardBg,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Pressable onPress={() => setMobileOpen(true)} accessibilityLabel="Open menu">
              <Menu size={20} color={colors.textMuted} />
            </Pressable>
            <CaloviaLogo href="/" size={40} />
          </View>
        ) : null}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </View>

      {!isDesktop ? (
        <Modal visible={mobileOpen} animationType="slide" transparent>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ width: 256, height: "100%" }}>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </View>
            <Pressable
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
              onPress={() => setMobileOpen(false)}
            >
              <Pressable
                style={{ position: "absolute", top: 16, left: 260 }}
                onPress={() => setMobileOpen(false)}
              >
                <X size={24} color="#fff" />
              </Pressable>
            </Pressable>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
