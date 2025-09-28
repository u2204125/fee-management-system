/**
 * Constants used throughout the application
 */

// User roles
export const USER_ROLES = {
  DEVELOPER: 'developer',
  ADMIN: 'admin',
  USER: 'user',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Discount types
export const DISCOUNT_TYPES = {
  FIXED: 'fixed',
  PERCENTAGE: 'percentage',
} as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  STUDENTS: '/api/students',
  PAYMENTS: '/api/payments',
  INSTITUTIONS: '/api/institutions',
  BATCHES: '/api/batches',
  COURSES: '/api/courses',
  MONTHS: '/api/months',
  USERS: '/api/users',
  ACTIVITIES: '/api/activities',
  REFERENCE_OPTIONS: '/api/reference-options',
  RECEIVED_BY_OPTIONS: '/api/received-by-options',
} as const;

// Application routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  STUDENT_MANAGEMENT: '/student-management',
  STUDENTS_DATABASE: '/students-database',
  FEE_PAYMENT: '/fee-payment',
  BATCH_MANAGEMENT: '/batch-management',
  REPORTS: '/reports',
  DISCOUNT_REPORTS: '/discount-reports',
  REFERENCE_MANAGEMENT: '/reference-management',
  USER_MANAGEMENT: '/user-management',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  STUDENTS: 'students',
  PAYMENTS: 'payments',
  INSTITUTIONS: 'institutions',
  BATCHES: 'batches',
  COURSES: 'courses',
  MONTHS: 'months',
  USERS: 'users',
  ACTIVITIES: 'activities',
  REFERENCE_OPTIONS: 'reference-options',
  RECEIVED_BY_OPTIONS: 'received-by-options',
  DISCOUNTED_PAYMENTS: 'discounted-payments',
  SESSION: 'session',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
  INVALID_NUMBER: 'Please enter a valid number',
  POSITIVE_NUMBER: 'Please enter a positive number',
} as const;

// Currency symbol
export const CURRENCY_SYMBOL = '৳';

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy hh:mm a',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Toast notification durations
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;