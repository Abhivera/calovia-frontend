// Base URL includes /api/v1 prefix (see Dietly API docs).
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
};

export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${path}`;
};
