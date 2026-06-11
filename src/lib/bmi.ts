export function calculateBmi(weightKg: number | null, heightCm: number | null) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiStatus(bmi: number | null) {
  if (bmi == null) return { label: "—", color: "#9ca3af" };
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal", color: "#24a17b" };
  if (bmi < 30) return { label: "Overweight", color: "#eab308" };
  return { label: "Obese", color: "#ef4444" };
}
