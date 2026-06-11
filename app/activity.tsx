import ProtectedScreen from "@/hooks/useAuthGuard";
import ActivityLogScreen from "@/screens/ActivityLogScreen";

export default function ActivityRoute() {
  return (
    <ProtectedScreen>
      <ActivityLogScreen />
    </ProtectedScreen>
  );
}
