"use client";

import { useEffect, useState } from "react";
import { customerApi } from "@/lib/api";
import { Customer } from "@/types";
import Link from "next/link";
import { Search, Plus, Phone, Mail, ChevronRight } from "lucide-react";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (query?: string) => {
    try {
      setLoading(true);
      const res = await customerApi.search(query || "");
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(search);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "inactive":
        return <span className="badge badge-gray">Inactive</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer profiles and service history
          </p>
        </div>
        <Link href="/admin/customers/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="card p-4">
        <div className="relative flex items-center gap-2">
          <Search className="absolute left-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          <button type="submit" className="btn-primary py-2.5">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                loadCustomers();
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Customer List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center p-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <Link
                key={customer.customerId}
                href={`/admin/customers/${customer.customerId}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {customer.name}
                      </h3>
                      {getStatusBadge(customer.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phoneNumber || "N/A"}
                      </span>
                      {customer.hairExtensionType && (
                        <span className="badge badge-info">
                          {customer.hairExtensionType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="text-right hidden md:block">
                    <p>{customer.totalSessions} sessions</p>
                    <p className="text-xs">{customer.totalOrders} orders</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Import Users icon
import { Users } from "lucide-react";
