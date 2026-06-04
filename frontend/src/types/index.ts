// ===================== Common =====================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ===================== Auth =====================
export interface User {
  userId: number;
  username: string;
  role: string;
  isActive: boolean;
  expirationDate: string;
  createdAt: string;
}

export interface LoginResponse {
  userId: number;
  username: string;
  role: string;
  token?: string;
}

// ===================== Product =====================
export interface Product {
  productId: number;
  barcode: string;
  productName: string;
  composition?: string;
  manufacturer?: string;
  scheduleType: string;
  category: string;
  hsnCode?: string;
  taxRate: number;
  sellingPrice: number;
  totalStocks: number;
  expiredStocks: number;
  nearExpiryStocks: number;
  status: string;
  batches: Batch[];
}

export interface Batch {
  batchId: number;
  productId: number;
  batchCode: string;
  expiryDate: string;
  costPrice: number;
  mrp: number;
  sellingPrice: number;
  stocks: number;
  expiryStatus: string;
}

// ===================== Customer =====================
export interface Customer {
  customerId: number;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfBirth?: string;
  gender?: string;
  photoUrl?: string;
  hairExtensionType?: string;
  hairLength?: string;
  hairColor?: string;
  installationDate?: string;
  status: string;
  notes?: string;
  referredBy?: string;
  lastVisitDate?: string;
  totalVisits: number;
  totalSessions: number;
  totalOrders: number;
  createdAt: string;
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  type: "SESSION" | "ORDER" | "INSTALLATION";
  date: string;
  title: string;
  description: string;
  status?: string;
  amount?: string;
  serviceType?: string;
  referenceId: number;
}

// ===================== Session =====================
export interface ServiceSession {
  sessionId: number;
  customerId: number;
  customerName: string;
  sessionDate: string;
  serviceType: string;
  serviceDescription?: string;
  technicianName?: string;
  productsUsed?: string;
  bundlesUsed?: number;
  cost?: number;
  customerRating?: number;
  notes?: string;
  nextSessionDate?: string;
  nextSessionInterval?: number;
  status: string;
  createdAt: string;
  photos?: Photo[];
}

// ===================== Appointment =====================
export interface Appointment {
  appointmentId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  appointmentDate: string;
  endTime?: string;
  serviceType: string;
  serviceDescription?: string;
  durationMinutes: number;
  status: string;
  notes?: string;
  reminderSent: boolean;
  assignedToName?: string;
  createdAt: string;
}

// ===================== Order =====================
export interface Order {
  orderId: number;
  invoiceNo: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  subTotal: number;
  discount: number;
  taxAmount: number;
  finalAmount: number;
  doctorName?: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payment?: PaymentInfo;
}

export interface OrderItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentInfo {
  cash: number;
  upi: number;
  card: number;
  totalPaid: number;
  excessAmount: number;
}

// ===================== Dashboard =====================
export interface DashboardWidget {
  todaySessions: number;
  tomorrowSessions: number;
  weekSessions: number;
  overdueCustomers: number;
  missedSessions: number;
  followUpDue: number;
  recentSessions: SessionSummary[];
  dueTodayCustomers: CustomerSummary[];
  overdueCustomersList: CustomerSummary[];
  currentShift?: ShiftSummary;
}

export interface SessionSummary {
  sessionId: number;
  customerName: string;
  serviceType: string;
  sessionDate: string;
  status: string;
}

export interface CustomerSummary {
  customerId: number;
  name: string;
  phone: string;
  lastVisit: string;
  nextSessionDate: string;
  hairExtensionType: string;
}

export interface ShiftSummary {
  shiftId: number;
  cashierName?: string;
  startTime: string;
  status: string;
}

// ===================== Photo =====================
export interface Photo {
  photoId: number;
  customerId: number;
  sessionId?: number;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  photoType: string;
  category: string;
  publicUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}
