import ProtectedScreen from "@/hooks/useAuthGuard";
import MealLogScreen from "@/screens/MealLogScreen";

export default function MealLogRoute() {
  return (
    <ProtectedScreen>
      <MealLogScreen />
    </ProtectedScreen>
  );
}
