import api from "@/lib/api";

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => api.post("/auth/reset-password", data),
  verifyEmail: (otp: string) => api.post("/auth/verify-email", { otp }),
  resendVerification: () => api.post("/auth/resend-verification"),
};

// ─── Messages (Inbox) ─────────────────────────────────────────────────────
export const messagesApi = {
  list: (page = 1) => api.get("/messages", { params: { page } }),
  markRead: (id: number) => api.patch(`/messages/${id}/read`),
  reply: (id: number, reply_text: string) =>
    api.post(`/messages/${id}/reply`, { reply_text }),
  delete: (id: number) => api.delete(`/messages/${id}`),
};

// ─── Anonymous Send ────────────────────────────────────────────────────────
export const sendApi = {
  getProfile: (username: string) => api.get(`/users/${username}/profile`),
  sendMessage: (username: string, data: { content: string }) =>
    api.post(`/users/${username}/messages`, data),
  saveSenderInterest: (messageId: number, email: string) =>
    api.post(`/messages/${messageId}/sender-interest`, { email }),
  viewReply: (senderToken: string) => api.get(`/messages/reply/${senderToken}`),
};

// ─── Rooms ─────────────────────────────────────────────────────────────────
export const roomsApi = {
  list: () => api.get("/rooms"),
  get: (code: string) => api.get(`/rooms/${code}`),
  create: (data: { name: string; topic?: string; password?: string }) =>
    api.post("/rooms", data),
  update: (
    id: number,
    data: Partial<{
      name: string;
      topic: string;
      is_active: boolean;
      is_readonly: boolean;
    }>,
  ) => api.patch(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
  sendMessage: (
    code: string,
    data: { content: string; session_token: string },
  ) => api.post(`/rooms/${code}/messages`, data),
  clearMessages: (id: number) => api.delete(`/rooms/${id}/messages`),
  deleteMessage: (id: number, msgId: number) =>
    api.delete(`/rooms/${id}/messages/${msgId}`),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get("/notifications"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// ─── Settings & Profile ────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get("/settings"),
  update: (
    data: Partial<{
      theme_preference: string;
      message_retention_months: number;
    }>,
  ) => api.patch("/settings", data),
};

export const profileApi = {
  get: () => api.get("/profile"),
  update: (data: Partial<{ name: string; bio: string; avatar_seed: string }>) =>
    api.patch("/profile", data),
};

// ─── Reports & Reveal ─────────────────────────────────────────────────────
export const reportsApi = {
  submit: (data: {
    message_id?: number;
    room_message_id?: number;
    reason: string;
    extra_detail?: string;
  }) => api.post("/reports", data),
};

export const revealApi = {
  saveInterest: (message_id: number) =>
    api.post("/reveal-interests", { message_id }),
};

// ─── Public Stats ─────────────────────────────────────────────────────────
export const statsApi = {
  public: () => api.get("/stats/public"),
};
