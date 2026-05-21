const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StepBarChart({ days = [], stepGoal = 8000 }) {
  const maxSteps = Math.max(stepGoal, ...days.map((d) => d.steps || 0), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1 h-28">
        {days.map((day, i) => {
          const height = ((day.steps || 0) / maxSteps) * 100;
          const isToday = i === days.length - 1;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
            >
              <div
                className={`w-full max-w-[28px] rounded-t-md transition-all ${
                  isToday ? "bg-[#24a17b]" : "bg-[#c5e8dc]"
                }`}
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${day.steps} steps`}
              />
              <span className="text-[10px] text-gray-400 font-medium">
                {DAY_LABELS[i % 7]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
