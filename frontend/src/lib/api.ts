import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);

// ===================== Auth API =====================
export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),

  logout: () => api.post("/auth/logout"),

  getSession: () => api.get("/auth/session"),
};

// ===================== Product API =====================
export const productApi = {
  search: (q?: string) => api.get("/products", { params: { q } }),

  getById: (id: number) => api.get(`/products/${id}`),

  getByBarcode: (barcode: string) => api.get(`/products/barcode/${barcode}`),

  create: (data: any) => api.post("/products", data),

  update: (id: number, data: any) => api.put(`/products/${id}`, data),

  delete: (id: number) => api.delete(`/products/${id}`),

  getBatches: (productId: number) => api.get(`/products/${productId}/batches`),

  addBatch: (data: any) => api.post("/products/batches", data),

  updateBatch: (id: number, data: any) => api.put(`/products/batches/${id}`, data),

  deleteBatch: (id: number) => api.delete(`/products/batches/${id}`),
};

// ===================== Customer API =====================
export const customerApi = {
  search: (q?: string) => api.get("/customers", { params: { q } }),

  getById: (id: number) => api.get(`/customers/${id}`),

  create: (data: any) => api.post("/customers", data),

  update: (id: number, data: any) => api.put(`/customers/${id}`, data),

  getTimeline: (id: number) => api.get(`/customers/${id}/timeline`),
};

// ===================== Session API =====================
export const sessionApi = {
  getCustomerSessions: (customerId: number) =>
    api.get(`/sessions/customer/${customerId}`),

  getById: (id: number) => api.get(`/sessions/${id}`),

  create: (data: any) => api.post("/sessions", data),

  update: (id: number, data: any) => api.put(`/sessions/${id}`, data),

  delete: (id: number) => api.delete(`/sessions/${id}`),
};

// ===================== Appointment API =====================
export const appointmentApi = {
  getByDate: (date: string) => api.get("/appointments", { params: { date } }),

  getByRange: (start: string, end: string) =>
    api.get("/appointments", { params: { start, end } }),

  getCalendar: (start: string, end: string) =>
    api.get("/appointments/calendar", { params: { start, end } }),

  getByCustomer: (customerId: number) =>
    api.get("/appointments", { params: { customerId } }),

  create: (data: any) => api.post("/appointments", data),

  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),

  updateStatus: (id: number, status: string) =>
    api.patch(`/appointments/${id}/status`, null, { params: { status } }),

  delete: (id: number) => api.delete(`/appointments/${id}`),
};

// ===================== Order API =====================
export const orderApi = {
  create: (data: any) => api.post("/orders", data),

  getByInvoice: (invoiceNo: string) => api.get(`/orders/${invoiceNo}`),

  saveActiveBill: (billsData: string) =>
    api.post("/orders/active/save", { billsData }),

  getActiveBills: () => api.get("/orders/active"),
};

// ===================== Shift API =====================
export const shiftApi = {
  start: (openingCash: number) => api.post("/shifts/start", { openingCash }),

  close: (finalCash: number) => api.post("/shifts/close", { finalCash }),

  getActive: () => api.get("/shifts/active"),

  getAll: () => api.get("/shifts"),

  getById: (id: number) => api.get(`/shifts/${id}`),
};

// ===================== Dashboard API =====================
export const dashboardApi = {
  getOwner: () => api.get("/dashboard/owner"),
};

// ===================== Photo API =====================
export const photoApi = {
  upload: (formData: FormData) =>
    api.post("/photos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getCustomerPhotos: (customerId: number) =>
    api.get(`/photos/customer/${customerId}`),

  getSessionPhotos: (sessionId: number) =>
    api.get(`/photos/session/${sessionId}`),

  delete: (id: number) => api.delete(`/photos/${id}`),
};

// ===================== Admin API =====================
export const adminApi = {
  getUsers: () => api.get("/admin/users"),

  createUser: (data: any) => api.post("/admin/users", data),

  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
};

export default api;
