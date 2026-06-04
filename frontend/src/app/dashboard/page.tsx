"use client";

import { useEffect, useState } from "react";
import { authApi, productApi, orderApi, customerApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Loader2, Search, ShoppingCart, Plus, Minus, Trash2,
  Barcode, Package, User, LogOut, X, Receipt, UserPlus
} from "lucide-react";

export default function CashierDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", phoneNumber: "", email: "" });
  const [customerSaving, setCustomerSaving] = useState(false);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerSaving(true);
    try {
      await customerApi.create({
        name: customerForm.name,
        phoneNumber: customerForm.phoneNumber,
        email: customerForm.email,
      });
      toast.success("Customer created!");
      setShowNewCustomer(false);
      setCustomerForm({ name: "", phoneNumber: "", email: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
    } finally {
      setCustomerSaving(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authApi.getSession();
      if (res.data.success) {
        setUsername(res.data.data.username);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    router.push("/login");
  };

  const searchProducts = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await productApi.search(q);
      setSearchResults(res.data.data || []);
    } catch {
      setSearchResults([]);
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.productId);
      if (existing) {
        return prev.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.productId === productId);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(i => i.productId !== productId);
      }
      return prev.map(i =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      );
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;
    try {
      const res = await productApi.getByBarcode(barcodeInput);
      addToCart(res.data.data);
      setBarcodeInput("");
    } catch {
      alert("Product not found with this barcode");
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.sellingPrice || 0) * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
        })),
        payment: {
          method: "CASH",
          amount: total,
        }
      };
      const res = await orderApi.create(orderData);
      alert(`Order created! Invoice: ${res.data.data?.invoiceNo || "N/A"}`);
      setCart([]);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Billing</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNewCustomer(true)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> New Customer
          </button>
          <span className="text-sm text-gray-500">{username}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Left - Product Search */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          {/* Barcode & Search */}
          <div className="p-4 space-y-3 bg-white border-b border-gray-200">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
                  placeholder="Scan barcode..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
              <button
                onClick={handleBarcodeSearch}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => searchProducts(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((product: any) => (
                  <button
                    key={product.productId}
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-between p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">₹{product.sellingPrice}</p>
                      <p className="text-xs text-gray-400">Stock: {product.stock || 0}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {searchResults.length === 0 && searchQuery.length > 0 && (
              <div className="text-center text-gray-400 mt-20">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No products found</p>
              </div>
            )}
            {searchQuery.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Search products to start billing</p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Cart */}
        <div className="w-96 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <h2 className="font-bold text-gray-900">Current Bill</h2>
              <span className="ml-auto text-sm text-gray-500">{cart.length} items</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs mt-1">Add products to start billing</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">₹{item.sellingPrice} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 rounded-lg hover:bg-gray-200 text-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 rounded-lg hover:bg-gray-200 text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.sellingPrice * item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Items</span>
              <span className="font-medium">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="font-bold text-blue-600 text-2xl">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              GENERATE BILL
            </button>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">New Customer</h2>
              <button onClick={() => setShowNewCustomer(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Customer name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={customerForm.phoneNumber}
                  onChange={(e) => setCustomerForm({ ...customerForm, phoneNumber: e.target.value })}
                  className="input-field"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="input-field"
                  placeholder="Email address"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={customerSaving} className="btn-primary flex-1 disabled:opacity-50">
                  {customerSaving ? "Creating..." : "Create Customer"}
                </button>
                <button type="button" onClick={() => setShowNewCustomer(false)} className="btn-secondary">
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
