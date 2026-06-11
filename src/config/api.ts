import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const API_CONFIG = {
  BASE_URL:
    (extra.apiBaseUrl as string | undefined) ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api/v1",
};

export const getApiUrl = (endpoint: string) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${path}`;
};
