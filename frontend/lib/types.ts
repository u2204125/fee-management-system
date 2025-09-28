/**
 * TypeScript type definitions for the application
 */

// User types
export interface User {
  _id: string;
  username: string;
  role: 'developer' | 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Institution types
export interface Institution {
  _id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// Batch types
export interface Batch {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Course types
export interface Course {
  _id: string;
  name: string;
  batchId: string | Batch;
  createdAt: string;
  updatedAt: string;
}

// Month types
export interface Month {
  _id: string;
  name: string;
  courseId: string | Course;
  monthNumber: number;
  payment: number;
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student types
export interface StudentEnrollment {
  courseId: string | Course;
  startingMonthId: string | Month;
  endingMonthId?: string | Month;
}

export interface Student {
  _id: string;
  studentId: string;
  name: string;
  institutionId: string | Institution;
  batchId: string | Batch;
  gender: 'male' | 'female' | 'other';
  phone: string;
  guardianName: string;
  guardianPhone: string;
  enrolledCourses: StudentEnrollment[];
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface MonthPayment {
  monthId: string | Month;
  paidAmount: number;
  discountAmount: number;
}

export interface Payment {
  _id: string;
  invoiceNumber: string;
  studentId: string | Student;
  studentName: string;
  paidAmount: number;
  discountAmount: number;
  discountType: 'fixed' | 'percentage';
  months: string[] | Month[];
  monthPayments: MonthPayment[];
  reference: string;
  receivedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice types
export interface InvoiceMonthPayment {
  monthId: string | Month;
  monthName: string;
  courseName: string;
  amount: number;
  discountAmount: number;
}

export interface InvoiceTaxDetails {
  gstNumber?: string;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  paymentId: string | Payment;
  studentId: string | Student;
  studentName: string;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  discountType: 'fixed' | 'percentage';
  issueDate: string;
  dueDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'online';
  reference?: string;
  receivedBy: string;
  monthPayments: InvoiceMonthPayment[];
  institutionId: string | Institution;
  institutionName: string;
  institutionAddress?: string;
  notes?: string;
  taxDetails: InvoiceTaxDetails;
  createdBy: string | User;
  lastModifiedBy?: string | User;
  pdfPath?: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  netAmount?: number;
  remainingBalance?: number;
  isPaid?: boolean;
  isOverdue?: boolean;
}

// Activity types
export interface Activity {
  _id: string;
  type: string;
  description: string;
  userId: string | User;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Options types
export interface ReferenceOption {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivedByOption {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface StudentFormData {
  name: string;
  institutionId: string;
  batchId: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  guardianName: string;
  guardianPhone: string;
  enrolledCourses: StudentEnrollment[];
}

export interface PaymentFormData {
  studentId: string;
  selectedMonths: string[];
  paidAmount: string;
  discountAmount: string;
  discountType: 'fixed' | 'percentage';
  reference: string;
  customReference: string;
  receivedBy: string;
  customReceivedBy: string;
}

export interface InvoiceFormData {
  paymentId: string;
  dueDate?: string;
  notes?: string;
  emailToSend?: boolean;
}

export interface InvoiceUpdateFormData {
  status?: string;
  dueDate?: string;
  notes?: string;
  paymentMethod?: string;
  reference?: string;
  receivedBy?: string;
}

export interface InstitutionFormData {
  name: string;
  address: string;
}

export interface UserFormData {
  username: string;
  password: string;
  role: 'developer' | 'admin' | 'user';
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface StudentFilters {
  search: string;
  batch: string;
  institution: string;
  gender: string;
}

export interface PaymentFilters {
  dateFrom: string;
  dateTo: string;
  studentId: string;
  hasDiscount: boolean;
}

export interface InvoiceFilters {
  status: string;
  studentId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

// Statistics types
export interface DashboardStats {
  totalStudents: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
}

// Theme types
export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (roles: string[]) => boolean;
}