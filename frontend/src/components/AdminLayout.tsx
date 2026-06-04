"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Clock,
  Users,
  Calendar,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authApi.getSession();
      const data = res.data;
      if (data.success) {
        setUsername(data.data.username);
        if (data.data.role !== "admin") {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/stocks", label: "Stock Inventory", icon: Package },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/appointments", label: "Calendar", icon: Calendar },
    { href: "/admin/cash", label: "Cash Management", icon: DollarSign },
    { href: "/admin/shifts", label: "Shift Management", icon: Clock },
    { href: "/admin/users", label: "User Management", icon: UserCircle },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg">SpeedBilling</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-bold text-xl tracking-tight text-gray-900">
            SpeedBilling{" "}
            <span className="text-blue-500 font-medium text-sm">Admin</span>
          </h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{username}</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
