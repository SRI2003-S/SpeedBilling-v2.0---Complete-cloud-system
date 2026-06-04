"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CashierDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authApi.getSession();
      if (!res.data.success) {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Cashier Dashboard</h1>
      <p className="text-gray-500 mt-2">
        Billing interface coming soon. The full billing UI (product search,
        cart management, payment processing) will be implemented here.
      </p>
    </div>
  );
}
