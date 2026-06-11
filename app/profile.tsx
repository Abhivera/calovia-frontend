import ProtectedScreen from "@/hooks/useAuthGuard";
import ProfileScreen from "@/screens/ProfileScreen";

export default function ProfileRoute() {
  return (
    <ProtectedScreen>
      <ProfileScreen />
    </ProtectedScreen>
  );
}
