import { formatNumber } from "@/lib/format";

export default function MealAnalysisResult({
  analysis,
  onSave,
  onDiscard,
  saving = false,
}) {
  if (!analysis) return null;

  const nutrients = analysis.nutrients || {};
  const exercise = analysis.exercise_recommendations;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 animate-in fade-in">
      {analysis.food_items?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {analysis.food_items.map((item) => (
            <span
              key={item}
              className="px-3 py-1 rounded-full text-sm bg-[#e8f5f0] text-[#1a7a5c] font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {analysis.description && (
        <p className="text-sm text-gray-600">{analysis.description}</p>
      )}

      <div className="text-center py-2">
        <p className="text-4xl font-bold text-gray-900">
          {formatNumber(analysis.calories)}
        </p>
        <p className="text-sm text-gray-500">calories</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          ["Protein", nutrients.protein, "text-[#24a17b]"],
          ["Carbs", nutrients.carbs, "text-yellow-600"],
          ["Fat", nutrients.fat, "text-orange-500"],
          ["Sugar", nutrients.sugar, "text-cyan-600"],
        ].map(([label, val, color]) => (
          <div
            key={label}
            className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <p className={`text-lg font-bold ${color}`}>{val ?? 0}g</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {exercise && (
        <div className="rounded-lg bg-[#f0faf6] border border-[#c5e8dc] p-4">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Exercise to burn
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-[#24a17b]">
                {formatNumber(exercise.steps)}
              </p>
              <p className="text-xs text-gray-500">steps</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {exercise.walking_km} km
              </p>
              <p className="text-xs text-gray-500">walking</p>
            </div>
          </div>
        </div>
      )}

      {(onSave || onDiscard) && (
        <div className="flex gap-3 pt-1">
          {onDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Discard
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#24a17b] hover:bg-[#1e8a6a] text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save meal"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
