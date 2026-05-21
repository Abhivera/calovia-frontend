import { useSelector } from "react-redux";
import Dashboard from "./Dashboard";
import NonUserHome from "./NonUserHome";

export default function Home() {
  const token = useSelector((state) => state.auth.token);
  return token ? <Dashboard /> : <NonUserHome />;
}
