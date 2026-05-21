import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import DietlyLogo from "./DietlyLogo";
import { Menu, X } from "lucide-react";

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f7f8f6] flex">
      <AppSidebar />

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 transform transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <DietlyLogo to="/" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2 text-sm">
          {[
            ["/", "Dashboard"],
            ["/meal-log", "Log meal"],
            ["/activity", "Activity"],
            ["/progress", "Progress"],
            ["/profile", "Profile"],
            ["/settings", "Settings"],
          ].map(([path, label]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg ${
                location.pathname === path
                  ? "bg-[#e8f5f0] text-[#1a7a5c] font-medium"
                  : "text-gray-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 text-gray-600"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <DietlyLogo to="/" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
