"use client";

import { Clock } from "lucide-react";

export default function ShiftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          View shift details and cashier sessions
        </p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Shift management data available via /api/shifts endpoint.</p>
      </div>
    </div>
  );
}
