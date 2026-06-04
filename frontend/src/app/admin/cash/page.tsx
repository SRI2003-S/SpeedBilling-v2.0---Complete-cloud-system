"use client";

import { useEffect, useState } from "react";
import { shiftApi } from "@/lib/api";
import { toast } from "sonner";
import { DollarSign, Clock, TrendingUp, X } from "lucide-react";

interface Shift {
  shiftId: number;
  userId: number;
  openingCash: number;
  finalCash: number | null;
  startTime: string;
  endTime: string | null;
  status: boolean;
  notes: string | null;
  createdAt: string;
}

export default function CashManagementPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [finalCash, setFinalCash] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftsRes, activeRes] = await Promise.all([
        shiftApi.getAll(),
        shiftApi.getActive(),
      ]);
      setShifts(shiftsRes.data.data || []);

      if (activeRes.data.success && activeRes.data.data) {
        setActiveShift(activeRes.data.data);
      } else {
        setActiveShift(null);
      }
    } catch (err: any) {
      toast.error("Failed to load cash data");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shiftApi.close(parseFloat(finalCash));
      toast.success("Shift closed!");
      setShowCloseShift(false);
      setFinalCash("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to close shift");
    }
  };

  const totalCollected = shifts
    .filter((s) => !s.status && s.finalCash && s.openingCash)
    .reduce((sum, s) => sum + (s.finalCash! - s.openingCash), 0);

  const activeShifts = shifts.filter((s) => s.status).length;
  const closedShifts = shifts.filter((s) => !s.status).length;

  const getStatusBadge = (status: boolean) => {
    return status
      ? <span className="badge badge-success">Active</span>
      : <span className="badge badge-gray">Closed</span>;
  };

  const formatDateTime = (dt: string) => {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end?: string | null) => {
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const hours = Math.floor((e - s) / 3600000);
    const mins = Math.floor(((e - s) % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cash Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track shift collections and cash flow
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card border-l-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Shifts</p>
          <p className="text-3xl font-bold text-gray-900">{shifts.length}</p>
        </div>
        <div className="stat-card border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Total Cash Collected</p>
          <p className="text-3xl font-bold text-green-600">
            ₹{totalCollected.toFixed(2)}
          </p>
        </div>
        <div className="stat-card border-l-orange-500">
          <p className="text-sm font-medium text-gray-500">Active Shifts</p>
          <p className="text-3xl font-bold text-orange-600">{activeShifts}</p>
        </div>
        <div className="stat-card border-l-purple-500">
          <p className="text-sm font-medium text-gray-500">Closed Shifts</p>
          <p className="text-3xl font-bold text-purple-600">{closedShifts}</p>
        </div>
      </div>

      {/* Active Shift Card */}
      {activeShift ? (
        <div className="card p-6 border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Active Shift #{activeShift.shiftId}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Started: {formatDateTime(activeShift.startTime)}</p>
                  <p>Duration: {getDuration(activeShift.startTime)}</p>
                  <p>Opening Cash: <span className="font-medium">₹{activeShift.openingCash.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCloseShift(true)}
              className="btn-danger"
            >
              Close Shift
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6 border-l-4 border-l-gray-300">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <p className="text-gray-500">No active shift</p>
          </div>
        </div>
      )}

      {/* Shift History Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Shift History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Shift ID</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">End Time</th>
                <th className="px-6 py-4 text-right">Opening Cash</th>
                <th className="px-6 py-4 text-right">Final Cash</th>
                <th className="px-6 py-4 text-center">Duration</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {shifts.length > 0 ? (
                shifts.map((s) => (
                  <tr key={s.shiftId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{s.shiftId}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDateTime(s.startTime)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.endTime ? formatDateTime(s.endTime) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">₹{s.openingCash.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {s.finalCash != null ? `₹${s.finalCash.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">
                      {getDuration(s.startTime, s.endTime)}
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(s.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No shifts recorded yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Shift Modal */}
      {showCloseShift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Close Shift</h2>
              <button onClick={() => setShowCloseShift(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCloseShift} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500">Opening Cash:</span>
                  <span className="font-medium">₹{activeShift?.openingCash.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Started:</span>
                  <span className="font-medium">{activeShift ? formatDateTime(activeShift.startTime) : ""}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Cash Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={finalCash}
                  onChange={(e) => setFinalCash(e.target.value)}
                  className="input-field"
                  placeholder="Enter final cash count"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Close Shift
                </button>
                <button type="button" onClick={() => setShowCloseShift(false)} className="btn-secondary">
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
