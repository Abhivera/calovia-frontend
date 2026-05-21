export default function PillButton({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "border-[#24a17b] text-[#1a7a5c] bg-white"
          : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}
