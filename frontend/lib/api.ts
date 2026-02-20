import axios from "axios";
import { useAuthStore } from "@/lib/stores/authStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gwam.dumostech.com/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 and 503
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    if (error.response?.status === 503) {
      if (typeof window !== "undefined") window.location.href = "/maintenance";
    }
    return Promise.reject(error);
  },
);

export default api;
