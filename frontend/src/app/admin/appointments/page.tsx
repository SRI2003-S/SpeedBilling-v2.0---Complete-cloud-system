"use client";

import { useEffect, useState } from "react";
import { appointmentApi } from "@/lib/api";
import { Appointment } from "@/types";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

type ViewType = "day" | "week" | "month";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [showNew, setShowNew] = useState(false);

  // New appointment form
  const [form, setForm] = useState({
    customerId: "",
    appointmentDate: "",
    appointmentTime: "",
    serviceType: "",
    durationMinutes: "60",
    notes: "",
  });

  useEffect(() => {
    loadAppointments();
  }, [currentDate, view]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      const res = await appointmentApi.getCalendar(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (view === "day") {
      return { start: currentDate, end: currentDate };
    }

    if (view === "week") {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    }

    // Month
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { start, end };
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() + direction);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7 * direction);
    else newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="badge badge-info">Scheduled</span>;
      case "confirmed":
        return <span className="badge badge-success">Confirmed</span>;
      case "completed":
        return <span className="badge badge-gray">Completed</span>;
      case "cancelled":
        return <span className="badge badge-danger">Cancelled</span>;
      case "no_show":
        return <span className="badge badge-warning">No Show</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${form.appointmentDate}T${form.appointmentTime}`);
      await appointmentApi.create({
        customerId: parseInt(form.customerId),
        appointmentDate: dateTime.toISOString(),
        serviceType: form.serviceType,
        durationMinutes: parseInt(form.durationMinutes),
        notes: form.notes,
      });
      toast.success("Appointment created!");
      setShowNew(false);
      loadAppointments();
    } catch (err: any) {
      toast.error(err.message || "Failed to create appointment");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Appointment ${status}`);
      loadAppointments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayApps = appointments.filter(
        (a) => new Date(a.appointmentDate).toISOString().split("T")[0] === dateStr
      );
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 p-1 border border-gray-100 overflow-hidden ${
            isToday ? "bg-blue-50" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                isToday ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {dayApps.length > 0 && (
              <span className="text-[10px] text-gray-400">
                {dayApps.length}
              </span>
            )}
          </div>
          <div className="space-y-0.5 mt-0.5">
            {dayApps.slice(0, 3).map((a) => (
              <div
                key={a.appointmentId}
                className="text-[10px] px-1 py-0.5 rounded truncate bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                title={`${a.customerName} - ${a.serviceType}`}
              >
                {a.customerName?.split(" ")[0]}
              </div>
            ))}
            {dayApps.length > 3 && (
              <div className="text-[10px] text-gray-400 text-center">
                +{dayApps.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayApps = appointments.filter(
      (a) => new Date(a.appointmentDate).toISOString().split("T")[0] === dateStr
    );

    // Sort by time
    dayApps.sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
    );

    const hours = [];
    for (let h = 9; h <= 20; h++) {
      const hourApps = dayApps.filter(
        (a) => new Date(a.appointmentDate).getHours() === h
      );

      hours.push(
        <div key={h} className="flex border-b border-gray-100 min-h-[60px]">
          <div className="w-16 p-2 text-xs text-gray-400 border-r border-gray-100">
            {h.toString().padStart(2, "0")}:00
          </div>
          <div className="flex-1 p-1">
            {hourApps.map((a) => (
              <div
                key={a.appointmentId}
                className="p-2 mb-1 rounded-lg bg-blue-50 border border-blue-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-blue-900">
                    {a.customerName}
                  </span>
                  {getStatusBadge(a.status)}
                </div>
                <p className="text-xs text-blue-700">{a.serviceType}</p>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() =>
                      handleStatusChange(a.appointmentId, "completed")
                    }
                    className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(a.appointmentId, "cancelled")
                    }
                    className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return hours;
  };

  const viewTitle = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    ...(view === "day" && { day: "numeric" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer appointments and sessions
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Appointment
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">{viewTitle}</h2>
            <button
              onClick={() => navigate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              Today
            </button>
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["month", "week", "day"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : view === "month" ? (
          <>
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-gray-500 uppercase py-2"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">{renderMonthView()}</div>
          </>
        ) : view === "day" ? (
          <div>{renderDayView()}</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div
                key={a.appointmentId}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {a.customerName}
                    </span>
                    {getStatusBadge(a.status)}
                  </div>
                  <p className="text-sm text-gray-500">{a.serviceType}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-900 font-medium">
                    {new Date(a.appointmentDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-500">
                    {new Date(a.appointmentDate).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-center py-8 text-gray-400">
                No appointments this week
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></span>
          Scheduled
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span>
          Confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></span>
          Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span>
          Cancelled
        </span>
      </div>

      {/* New Appointment Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                New Appointment
              </h2>
              <button
                onClick={() => setShowNew(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID *
                </label>
                <input
                  type="number"
                  required
                  value={form.customerId}
                  onChange={(e) =>
                    setForm({ ...form, customerId: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter customer ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.appointmentDate}
                    onChange={(e) =>
                      setForm({ ...form, appointmentDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.appointmentTime}
                    onChange={(e) =>
                      setForm({ ...form, appointmentTime: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <select
                  required
                  value={form.serviceType}
                  onChange={(e) =>
                    setForm({ ...form, serviceType: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select service</option>
                  <option value="Installation">Installation</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Removal">Removal</option>
                  <option value="Repair">Repair</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Create Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
