const MACROS = [
  { key: "protein", label: "P", color: "#24a17b", track: "#d4ede4" },
  { key: "carbs", label: "C", color: "#eab308", track: "#fef3c7" },
  { key: "fat", label: "F", color: "#f97316", track: "#ffedd5" },
  { key: "sugar", label: "S", color: "#06b6d4", track: "#cffafe" },
];

function Ring({ label, value, color, track }) {
  const pct = Math.min((value / 100) * 100, 100);
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[72px] h-[72px]">
        <svg width="72" height="72" className="-rotate-90">
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={track}
            strokeWidth="6"
          />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-gray-800">{value}g</span>
    </div>
  );
}

export default function MacroRings({ nutrients = {} }) {
  const values = {
    protein: Math.round(nutrients.protein || 0),
    carbs: Math.round(nutrients.carbs || 0),
    fat: Math.round(nutrients.fat || 0),
    sugar: Math.round(nutrients.sugar || 0),
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {MACROS.map(({ key, label, color, track }) => (
        <Ring
          key={key}
          label={label}
          value={values[key]}
          color={color}
          track={track}
        />
      ))}
    </div>
  );
}
