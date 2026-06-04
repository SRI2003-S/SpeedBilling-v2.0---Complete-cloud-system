"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { DashboardWidget } from "@/types";
import {
  CalendarCheck,
  CalendarX,
  Users,
  Clock,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [widget, setWidget] = useState<DashboardWidget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getOwner();
      setWidget(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Sessions",
      value: widget?.todaySessions || 0,
      icon: CalendarCheck,
      color: "border-l-blue-500",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Tomorrow's Sessions",
      value: widget?.tomorrowSessions || 0,
      icon: CalendarCheck,
      color: "border-l-purple-500",
      iconBg: "bg-purple-100 text-purple-600",
    },
    {
      label: "This Week",
      value: widget?.weekSessions || 0,
      icon: Clock,
      color: "border-l-green-500",
      iconBg: "bg-green-100 text-green-600",
    },
    {
      label: "Overdue Customers",
      value: widget?.overdueCustomers || 0,
      icon: AlertTriangle,
      color: "border-l-red-500",
      iconBg: "bg-red-100 text-red-600",
    },
    {
      label: "Missed Sessions",
      value: widget?.missedSessions || 0,
      icon: CalendarX,
      color: "border-l-orange-500",
      iconBg: "bg-orange-100 text-orange-600",
    },
    {
      label: "Follow-up Due",
      value: widget?.followUpDue || 0,
      icon: UserCheck,
      color: "border-l-yellow-500",
      iconBg: "bg-yellow-100 text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your business at a glance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Today */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">Customers Due Today</h3>
          </div>
          <div className="p-4">
            {widget?.dueTodayCustomers?.length ? (
              <div className="space-y-3">
                {widget.dueTodayCustomers.map((c, i) => (
                  <Link
                    key={i}
                    href={`/admin/customers/${c.customerId}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone}</p>
                    </div>
                    <span className="badge badge-warning">Due Today</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No customers due today
              </p>
            )}
          </div>
        </div>

        {/* Overdue Customers */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">Overdue Customers</h3>
          </div>
          <div className="p-4">
            {widget?.overdueCustomersList?.length ? (
              <div className="space-y-3">
                {widget.overdueCustomersList.map((c, i) => (
                  <Link
                    key={i}
                    href={`/admin/customers/${c.customerId}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">
                        Last: {c.lastVisit}
                      </p>
                    </div>
                    <span className="badge badge-danger">Overdue</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No overdue customers
              </p>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">Recent Sessions</h3>
          </div>
          <div className="p-4">
            {widget?.recentSessions?.length ? (
              <div className="space-y-3">
                {widget.recentSessions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {s.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.serviceType} • {s.sessionDate}
                      </p>
                    </div>
                    <span className="badge badge-success">{s.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No recent sessions
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-3">
            <Link
              href="/admin/customers"
              className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <p className="font-medium text-gray-900">
                👤 Find Customer Profile
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Search, view timeline, manage sessions
              </p>
            </Link>
            <Link
              href="/admin/appointments"
              className="block p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <p className="font-medium text-gray-900">
                📅 View Appointment Calendar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Daily, weekly, monthly view
              </p>
            </Link>
            <Link
              href="/admin/customers"
              className="block p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <p className="font-medium text-gray-900">
                ➕ Register New Customer
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Add customer with hair extension details
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
