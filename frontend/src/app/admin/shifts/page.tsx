"use client";

import { useEffect, useState } from "react";
import { shiftApi } from "@/lib/api";
import { toast } from "sonner";
import { Clock, Play, Square, X } from "lucide-react";

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

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStartShift, setShowStartShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [openingCash, setOpeningCash] = useState("");
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
      toast.error("Failed to load shift data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shiftApi.start(parseFloat(openingCash) || 0);
      toast.success("Shift started!");
      setShowStartShift(false);
      setOpeningCash("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to start shift");
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

  const getStatusBadge = (status: boolean) => {
    return status
      ? <span className="badge badge-success">Active</span>
      : <span className="badge badge-gray">Closed</span>;
  };

  const formatDateTime = (dt: string) => {
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
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
        <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
        <p className="text-sm text-gray-500 mt-1">Start, manage, and close cashier shifts</p>
      </div>

      {/* Active Shift or Start Shift */}
      {activeShift ? (
        <div className="card p-6 border-l-4 border-l-green-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Play className="w-6 h-6" />
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
            <button onClick={() => setShowCloseShift(true)} className="btn-danger flex items-center gap-2">
              <Square className="w-4 h-4" /> Close Shift
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6 border-l-4 border-l-blue-500 bg-blue-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">No Active Shift</h3>
                <p className="text-sm text-gray-500 mt-1">Start a new shift to begin tracking</p>
              </div>
            </div>
            <button onClick={() => setShowStartShift(true)} className="btn-primary flex items-center gap-2">
              <Play className="w-4 h-4" /> Start Shift
            </button>
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">End Time</th>
                <th className="px-6 py-4 text-right">Opening</th>
                <th className="px-6 py-4 text-right">Final</th>
                <th className="px-6 py-4 text-center">Duration</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {shifts.length > 0 ? (
                shifts.map((s) => (
                  <tr key={s.shiftId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{s.shiftId}</td>
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
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No shifts recorded yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      {showStartShift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Start New Shift</h2>
              <button onClick={() => setShowStartShift(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStartShift} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Cash Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="input-field"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Start Shift</button>
                <button type="button" onClick={() => setShowStartShift(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShift && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Close Shift #{activeShift?.shiftId}</h2>
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
                <button type="submit" className="btn-primary flex-1">Close Shift</button>
                <button type="button" onClick={() => setShowCloseShift(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
