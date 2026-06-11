import ProtectedScreen from "@/hooks/useAuthGuard";
import ProgressScreen from "@/screens/ProgressScreen";

export default function ProgressRoute() {
  return (
    <ProtectedScreen>
      <ProgressScreen />
    </ProtectedScreen>
  );
}
