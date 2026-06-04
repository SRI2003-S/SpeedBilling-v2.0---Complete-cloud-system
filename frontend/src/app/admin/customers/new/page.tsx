"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dateOfBirth: "",
    gender: "",
    hairExtensionType: "",
    hairLength: "",
    hairColor: "",
    installationDate: "",
    notes: "",
    referredBy: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await customerApi.create({
        ...form,
        dateOfBirth: form.dateOfBirth || null,
        installationDate: form.installationDate || null,
      });
      toast.success("Customer created!");
      router.push(`/admin/customers/${res.data.data.customerId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Register a new customer with hair extension details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referred By
              </label>
              <input
                name="referredBy"
                value={form.referredBy}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="input-field"
                rows={2}
                placeholder="Address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="input-field"
                placeholder="City"
              />
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="input-field"
                placeholder="State"
              />
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="input-field"
                placeholder="Pincode"
              />
            </div>
          </div>
        </div>

        {/* Hair Extension Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Hair Extension Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extension Type
              </label>
              <select
                name="hairExtensionType"
                value={form.hairExtensionType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select type</option>
                <option value="Tape-in">Tape-in</option>
                <option value="Clip-in">Clip-in</option>
                <option value="Keratin Bond">Keratin Bond</option>
                <option value="Micro Ring">Micro Ring</option>
                <option value="Sew-in/Weave">Sew-in/Weave</option>
                <option value="Wig">Wig</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hair Length
              </label>
              <input
                name="hairLength"
                value={form.hairLength}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 18 inches"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hair Color
              </label>
              <input
                name="hairColor"
                value={form.hairColor}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Natural Black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation Date
              </label>
              <input
                name="installationDate"
                type="date"
                value={form.installationDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="input-field"
            rows={3}
            placeholder="Additional notes about the customer..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Customer"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
