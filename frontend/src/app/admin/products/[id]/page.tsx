"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, Package } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productApi.getById(productId);
      const p = res.data.data;
      setProduct(p);
      setForm({
        barcode: p.barcode || "",
        productName: p.productName || "",
        category: p.category || "",
        scheduleType: p.scheduleType || "Normal",
        composition: p.composition || "",
        manufacturer: p.manufacturer || "",
        hsnCode: p.hsnCode || "",
        taxRate: p.taxRate?.toString() || "0",
      });
    } catch (err: any) {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.update(productId, {
        ...form,
        taxRate: form.taxRate ? parseFloat(form.taxRate) : 0,
      });
      toast.success("Product updated!");
      router.push("/admin/stocks");
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.push("/admin/stocks")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Stock
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update product details - {product.barcode}
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
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/stocks")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
