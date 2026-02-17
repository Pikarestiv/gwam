"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useAdminStore } from "@/lib/stores/adminStore";
import { Ghost, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setToken, setAdmin } = useAdminStore();

  const loginMutation = useMutation({
    mutationFn: (creds: any) => adminApi.login(creds),
    onSuccess: (res) => {
      const { token, admin } = res.data.data;
      setToken(token);
      setAdmin(admin);
      router.push("/dashboard");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4 animate-float">
            <Ghost className="text-blue-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 mt-2">Sign in to manage Gwam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gwam.dumostech.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
