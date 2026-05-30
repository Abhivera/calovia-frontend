import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { token, loading, authReady } = useSelector((state) => state.auth);

  if (!authReady || loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-emerald-600">
        Loading…
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
}
