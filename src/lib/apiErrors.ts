import type { AxiosError } from "axios";

export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ detail?: string | { msg?: string }[]; message?: string }>;
  const data = axiosError?.response?.data;
  if (!data) return axiosError?.message || "Something went wrong";

  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).filter(Boolean).join(", ") || "Validation error";
  }
  if (data.message) return data.message;
  return "Something went wrong";
}
