import ProtectedScreen from "@/hooks/useAuthGuard";
import SettingsScreen from "@/screens/SettingsScreen";

export default function SettingsRoute() {
  return (
    <ProtectedScreen>
      <SettingsScreen />
    </ProtectedScreen>
  );
}
