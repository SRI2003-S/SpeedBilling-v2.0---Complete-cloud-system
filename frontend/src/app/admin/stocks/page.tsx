"use client";

import { useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import { Product } from "@/types";
import { Search, Package, AlertTriangle, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [batchForm, setBatchForm] = useState({
    productId: 0,
    batchCode: "",
    expiryDate: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    stocks: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (q?: string) => {
    try {
      setLoading(true);
      const res = await productApi.search(q || "");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(search);
  };

  const openAddBatch = (product: Product) => {
    setSelectedProduct(product);
    setBatchForm({
      productId: product.productId,
      batchCode: "",
      expiryDate: "",
      costPrice: "",
      mrp: "",
      sellingPrice: "",
      stocks: "",
    });
    setShowAddBatch(true);
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productApi.addBatch({
        productId: selectedProduct?.productId,
        batchCode: batchForm.batchCode,
        expiryDate: batchForm.expiryDate,
        costPrice: parseFloat(batchForm.costPrice),
        mrp: parseFloat(batchForm.mrp),
        sellingPrice: parseFloat(batchForm.sellingPrice),
        stocks: parseInt(batchForm.stocks),
      });
      toast.success("Batch added!");
      setShowAddBatch(false);
      loadProducts(search);
    } catch (err: any) {
      toast.error(err.message || "Failed to add batch");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product and all batches?")) return;
    try {
      await productApi.delete(id);
      toast.success("Product deleted");
      loadProducts(search);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Has Expired":
        return <span className="badge badge-danger">Expired</span>;
      case "Out of Stock":
        return <span className="badge badge-gray">Empty</span>;
      case "Low Stock":
        return <span className="badge badge-warning">Low</span>;
      default:
        return <span className="badge badge-success">Good</span>;
    }
  };

  // Calculate totals
  const totalProducts = products.length;
  const totalStocks = products.reduce((s, p) => s + p.totalStocks, 0);
  const lowStock = products.filter((p) => p.status === "Low Stock").length;
  const expired = products.filter((p) => p.expiredStocks > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage products, batches, and pricing
          </p>
        </div>
        <a
          href="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card border-l-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="stat-card border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Total Stock</p>
          <p className="text-3xl font-bold text-green-600">{totalStocks}</p>
        </div>
        <div className="stat-card border-l-orange-500">
          <p className="text-sm font-medium text-gray-500">Low Stock</p>
          <p className="text-3xl font-bold text-orange-600">{lowStock}</p>
        </div>
        <div className="stat-card border-l-red-500">
          <p className="text-sm font-medium text-gray-500">Has Expired</p>
          <p className="text-3xl font-bold text-red-600">{expired}</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="card p-4">
        <div className="relative flex items-center gap-2">
          <Search className="absolute left-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or barcode..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <button type="submit" className="btn-primary py-2.5">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                loadProducts();
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Product Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">MRP</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((p) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {p.productName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                          SKU: {p.barcode}
                        </span>
                        <span className="ml-2">{p.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-lg font-bold ${
                          p.totalStocks < 10 ? "text-red-500" : "text-gray-800"
                        }`}
                      >
                        {p.totalStocks}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a
                        href={`/admin/products/${p.productId}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => openAddBatch(p)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        + Batch
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.productId)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No products found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      {showAddBatch && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Add Batch - {selectedProduct.productName}
              </h2>
              <button
                onClick={() => setShowAddBatch(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchForm.batchCode}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, batchCode: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.expiryDate}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, expiryDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={batchForm.costPrice}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, costPrice: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={batchForm.mrp}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, mrp: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={batchForm.sellingPrice}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, sellingPrice: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={batchForm.stocks}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, stocks: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Add Batch
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBatch(false)}
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
