/**
 * Extract a user-facing message from Dietly API error responses.
 * @param {import('axios').AxiosError | Error} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || "Something went wrong";

  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    return data.detail.map((e) => e.msg).filter(Boolean).join(". ") || "Validation failed";
  }

  return "Something went wrong";
}
