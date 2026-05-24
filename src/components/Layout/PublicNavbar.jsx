import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import CaloviaLogo from "./CaloviaLogo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Try free", href: "#try-free" },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <CaloviaLogo
          to="/"
          imageClassName="h-[75px] w-[75px]"
          className="shrink-0 [&_span]:text-[17px] [&_span]:font-medium"
        />

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-gray-500 hover:text-[#1D9E75] transition-colors py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-1.5 text-[13px] rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 text-[13px] rounded-lg bg-[#1D9E75] text-white font-medium hover:bg-[#188f6a] transition-colors"
          >
            Get started free
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 mt-3 pt-3 px-4 pb-2 space-y-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="block py-2 text-sm text-gray-600 hover:text-[#1D9E75]"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={closeMenu}
            className="block py-2 text-sm text-gray-700"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            onClick={closeMenu}
            className="block py-2 text-sm font-medium text-[#1D9E75]"
          >
            Get started free
          </Link>
        </div>
      )}
    </header>
  );
}
