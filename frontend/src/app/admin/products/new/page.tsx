"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { productApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    barcode: "",
    productName: "",
    category: "",
    scheduleType: "Normal",
    composition: "",
    manufacturer: "",
    hsnCode: "",
    taxRate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productApi.create({
        ...form,
        taxRate: form.taxRate ? parseFloat(form.taxRate) : 0,
      });
      toast.success("Product created!");
      router.push("/admin/stocks");
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
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
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a new product to inventory
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode *
              </label>
              <input
                name="barcode"
                required
                value={form.barcode}
                onChange={handleChange}
                className="input-field"
                placeholder="Scan or enter barcode"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                name="productName"
                required
                value={form.productName}
                onChange={handleChange}
                className="input-field"
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select category</option>
                <option value="Hair Extensions">Hair Extensions</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Tools & Accessories">Tools & Accessories</option>
                <option value="Bundles">Bundles</option>
                <option value="Wigs">Wigs</option>
                <option value="Salon Products">Salon Products</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Type
              </label>
              <select
                name="scheduleType"
                value={form.scheduleType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Normal">Normal</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Narcotic">Narcotic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Composition
              </label>
              <input
                name="composition"
                value={form.composition}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 100% Remy Human Hair"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                className="input-field"
                placeholder="Manufacturer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HSN Code
              </label>
              <input
                name="hsnCode"
                value={form.hsnCode}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. 6704"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                name="taxRate"
                type="number"
                step="0.01"
                value={form.taxRate}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Product"}
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
