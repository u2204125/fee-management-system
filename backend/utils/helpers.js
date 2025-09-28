const crypto = require('crypto');
const Payment = require('../models/Payment');

/**
 * Generate a secure random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a sequential invoice number
 */
const generateInvoiceNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const count = await Payment.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `INV-${datePart}-${sequence}`;
};

/**
 * Format currency for display
 */
const formatCurrency = (amount, currency = 'BDT') => {
  if (typeof amount !== 'number') return '0.00';
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Sanitize user input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Environment check utilities
 */
const isProduction = () => process.env.NODE_ENV === 'production';
const isDevelopment = () => process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

module.exports = {
  generateToken,
  generateInvoiceNumber,
  formatCurrency,
  sanitizeInput,
  isProduction,
  isDevelopment
};