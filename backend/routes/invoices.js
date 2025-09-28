/**
 * Invoice Routes
 * Handles all invoice-related API endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByStudent,
  getOverdueInvoices,
  sendInvoice,
  cancelInvoice
} = require('../controllers/invoiceController');

const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with filtering and pagination
 * @access  Private
 */
router.get('/', getInvoices);

/**
 * @route   GET /api/invoices/overdue
 * @desc    Get overdue invoices
 * @access  Private
 */
router.get('/overdue', getOverdueInvoices);

/**
 * @route   GET /api/invoices/student/:studentId
 * @desc    Get invoices by student
 * @access  Private
 */
router.get('/student/:studentId', getInvoicesByStudent);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get single invoice by ID
 * @access  Private
 */
router.get('/:id', getInvoiceById);

/**
 * @route   POST /api/invoices
 * @desc    Create new invoice
 * @access  Private
 */
router.post('/', createInvoice);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice
 * @access  Private
 */
router.put('/:id', updateInvoice);

/**
 * @route   POST /api/invoices/:id/send
 * @desc    Mark invoice as sent
 * @access  Private
 */
router.post('/:id/send', sendInvoice);

/**
 * @route   POST /api/invoices/:id/cancel
 * @desc    Cancel invoice
 * @access  Private
 */
router.post('/:id/cancel', cancelInvoice);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice (draft only)
 * @access  Private (Admin/Developer only)
 */
router.delete('/:id', deleteInvoice);

module.exports = router;