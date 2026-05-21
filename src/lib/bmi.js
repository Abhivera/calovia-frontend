export function calculateBmi(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function getBmiStatus(bmi) {
  if (bmi == null) return { label: "—", className: "bg-gray-100 text-gray-600" };
  if (bmi < 18.5)
    return { label: "Underweight", className: "bg-blue-100 text-blue-700" };
  if (bmi < 25)
    return { label: "Normal", className: "bg-[#e8f5f0] text-[#1a7a5c]" };
  if (bmi < 30)
    return { label: "Overweight", className: "bg-amber-100 text-amber-800" };
  return { label: "Obese", className: "bg-red-100 text-red-700" };
}
