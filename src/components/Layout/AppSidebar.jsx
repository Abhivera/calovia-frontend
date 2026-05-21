import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/slices/authSlice";
import CaloviaLogo from "./CaloviaLogo";
import { getInitials } from "@/lib/format";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Activity,
  TrendingUp,
  Footprints,
  User,
  Settings,
  ArrowUpRight,
  LogOut,
} from "lucide-react";

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

function NavLink({ item }) {
  const location = useLocation();
  const isActive = item.stepsOnly
    ? location.pathname === "/activity" &&
      location.search.includes("tab=steps")
    : item.path === "/"
      ? location.pathname === "/"
      : location.pathname === item.path;

  const Icon = item.icon;
  const to = item.stepsOnly ? "/activity?tab=steps" : item.path;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#e8f5f0] text-[#1a7a5c]"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.external && (
        <ArrowUpRight className="w-3.5 h-3.5 opacity-50" aria-hidden />
      )}
    </Link>
  );
}

export default function AppSidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-200 bg-white min-h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100">
        <CaloviaLogo to="/" />
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <section>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Main
          </p>
          <div className="space-y-0.5">
            {MAIN_NAV.map((item) => (
              <NavLink key={`${item.path}-${item.label}`} item={item} />
            ))}
          </div>
        </section>

        <section>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Account
          </p>
          <div className="space-y-0.5">
            {ACCOUNT_NAV.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </section>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[#e8f5f0] text-[#24a17b] flex items-center justify-center text-sm font-semibold shrink-0">
            {getInitials(user?.full_name, user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
