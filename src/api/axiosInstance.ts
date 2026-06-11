import axios, { type AxiosError } from "axios";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import { API_CONFIG } from "@/config/api";
import { auth } from "@/lib/firebase";

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function shouldSignOutOn401(error: AxiosError<{ detail?: string }>) {
  const status = error.response?.status;
  if (status !== 401) return false;

  const detail = error.response?.data?.detail;
  if (typeof detail === "string") {
    if (detail.includes("Account not found")) return false;
    return true;
  }

  return true;
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail?: string }>) => {
    if (shouldSignOutOn401(error)) {
      if (auth.currentUser) {
        await signOut(auth);
      }
      router.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
