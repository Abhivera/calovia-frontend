import { Link } from "react-router-dom";

export default function DietlyLogo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-[#24a17b] shrink-0" aria-hidden />
      <span className="font-bold text-gray-900 text-lg tracking-tight">
        Dietly
      </span>
    </Link>
  );
}
