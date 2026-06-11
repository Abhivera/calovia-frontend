import { useSelector } from "react-redux";
import DashboardScreen from "@/screens/DashboardScreen";
import NonUserHomeScreen from "@/screens/NonUserHomeScreen";
import type { RootState } from "@/store";

export default function HomeRoute() {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <DashboardScreen /> : <NonUserHomeScreen />;
}
