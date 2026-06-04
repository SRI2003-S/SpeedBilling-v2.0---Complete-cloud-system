"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { User, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(username, password);
      const data = response.data;

      if (data.success) {
        toast.success("Login successful!");
        const role = data.data.role;
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="w-full max-w-md p-4 animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-900 p-8 text-center">
            <div className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight text-white mb-2">
              SpeedBilling
            </div>
            <p className="text-gray-400 text-sm">Sign in to start your shift</p>
          </div>

          <div className="p-8 pt-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Username / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium text-gray-700 bg-gray-50 focus:bg-white"
                    placeholder="Enter your ID"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors font-medium text-gray-700 bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl shadow-lg hover:shadow-blue-200 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "LOGGING IN..." : "LOGIN TO DASHBOARD"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400">
              <p>Forgot password? Contact Administrator.</p>
              <p className="mt-2">Version 2.0.0 • Cloud Billing System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
