import axios from "axios";
import { useAdminStore } from "@/lib/stores/adminStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAdminStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAdminStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export const adminApi = {
  // Auth
  login: (credentials: any) => api.post("/admin/auth/login", credentials),
  logout: () => api.post("/admin/auth/logout"),
  me: () => api.get("/admin/auth/me"),

  // Dashboard
  getStats: () => api.get("/admin/dashboard/stats"),

  // Users
  getUsers: (page = 1, search = "") =>
    api.get(`/admin/users?page=${page}&search=${search}`),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: number, status: any) =>
    api.patch(
      `/admin/users/${id}/${status.is_suspended ? "suspend" : "unsuspend"}`,
    ),

  // Messages
  getFlaggedMessages: (page = 1) =>
    api.get(`/admin/messages/flagged?page=${page}`),
  deleteMessage: (id: number) => api.delete(`/admin/messages/${id}`),
  approveMessage: (id: number) => api.patch(`/admin/messages/${id}/approve`),

  // Rooms
  getRooms: (page = 1) => api.get(`/admin/rooms?page=${page}`),
  deleteRoom: (id: number) => api.delete(`/admin/rooms/${id}`),

  // Blocked IPs
  getBlockedIps: () => api.get("/admin/blocked-ips"),
  unblockIp: (id: number) => api.delete(`/admin/blocked-ips/${id}`),
  blockIp: (ip: string) => api.post("/admin/blocked-ips", { ip }),

  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data: any) => api.patch("/admin/settings", data),
};
