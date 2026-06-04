"use client";

import { UserCircle } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage staff accounts and permissions
        </p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>User management available via /api/admin/users endpoint.</p>
      </div>
    </div>
  );
}
