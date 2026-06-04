"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

export default function CashManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cash Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track sales, refunds, and audit reports
        </p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Cash management reporting is available via the API.</p>
        <p className="text-sm mt-1">
          Use /api/reports/transactions and /api/reports/gst endpoints.
        </p>
      </div>
    </div>
  );
}
