/**
 * Invoice Controller
 * Handles invoice management operations
 */

const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const { generateInvoiceNumber } = require('../utils/helpers');

/**
 * Get all invoices with filtering and pagination
 * @route GET /api/invoices
 * @access Private
 */
const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      studentId,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (studentId) {
      filter.studentId = studentId;
    }
    
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }
    
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('studentId', 'name studentId phone')
        .populate('institutionId', 'name address')
        .populate('paymentId', 'createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

/**
 * Get single invoice by ID
 * @route GET /api/invoices/:id
 * @access Private
 */
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('studentId', 'name studentId phone guardianName guardianPhone gender')
      .populate('institutionId', 'name address')
      .populate('paymentId')
      .populate('monthPayments.monthId', 'name monthNumber dueDate payment')
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

/**
 * Create new invoice from payment
 * @route POST /api/invoices
 * @access Private
 */
const createInvoice = async (req, res) => {
  try {
    const {
      paymentId,
      dueDate,
      notes,
      emailToSend = false
    } = req.body;

    // Get payment details
    const payment = await Payment.findById(paymentId)
      .populate('studentId')
      .populate('monthPayments.monthId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get student and institution details
    const student = await Student.findById(payment.studentId._id)
      .populate('institutionId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Generate invoice number
    let invoiceNumber;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      invoiceNumber = generateInvoiceNumber();
      const existingInvoice = await Invoice.findOne({ invoiceNumber });
      
      if (!existingInvoice) {
        break;
      }
      
      attempts++;
      if (attempts === maxAttempts) {
        throw new Error('Unable to generate unique invoice number');
      }
    }

    // Prepare month payments data
    const monthPayments = payment.monthPayments.map(mp => ({
      monthId: mp.monthId._id,
      monthName: mp.monthId.name,
      courseName: mp.monthId.courseId?.name || 'Course',
      amount: mp.paidAmount,
      discountAmount: mp.discountAmount || 0
    }));

    // Create invoice
    const invoiceData = {
      invoiceNumber,
      paymentId: payment._id,
      studentId: student._id,
      studentName: student.name,
      totalAmount: payment.paidAmount + payment.discountAmount,
      paidAmount: payment.paidAmount,
      discountAmount: payment.discountAmount,
      discountType: payment.discountType,
      reference: payment.reference,
      receivedBy: payment.receivedBy,
      monthPayments,
      institutionId: student.institutionId._id,
      institutionName: student.institutionId.name,
      institutionAddress: student.institutionId.address,
      notes,
      dueDate,
      createdBy: req.user._id
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Populate the created invoice
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('studentId', 'name studentId')
      .populate('institutionId', 'name address')
      .populate('paymentId')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      data: populatedInvoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

/**
 * Update invoice
 * @route PUT /api/invoices/:id
 * @access Private
 */
const updateInvoice = async (req, res) => {
  try {
    const {
      status,
      dueDate,
      notes,
      paymentMethod,
      reference,
      receivedBy
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Update allowed fields
    if (status) invoice.status = status;
    if (dueDate) invoice.dueDate = dueDate;
    if (notes !== undefined) invoice.notes = notes;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (reference !== undefined) invoice.reference = reference;
    if (receivedBy) invoice.receivedBy = receivedBy;

    invoice.lastModifiedBy = req.user._id;

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('studentId', 'name studentId')
      .populate('institutionId', 'name address')
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username');

    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

/**
 * Delete invoice
 * @route DELETE /api/invoices/:id
 * @access Private (Admin/Developer only)
 */
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Only allow deletion if invoice is in draft status
    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft invoices'
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};

/**
 * Get invoices by student
 * @route GET /api/invoices/student/:studentId
 * @access Private
 */
const getInvoicesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, fromDate, toDate } = req.query;

    const options = {};
    if (status) options.status = status;
    if (fromDate) options.fromDate = new Date(fromDate);
    if (toDate) options.toDate = new Date(toDate);

    const invoices = await Invoice.findByStudent(studentId, options);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching student invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student invoices',
      error: error.message
    });
  }
};

/**
 * Get overdue invoices
 * @route GET /api/invoices/overdue
 * @access Private
 */
const getOverdueInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.getOverdueInvoices();

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue invoices',
      error: error.message
    });
  }
};

/**
 * Mark invoice as sent
 * @route POST /api/invoices/:id/send
 * @access Private
 */
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await invoice.markAsSent();

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice marked as sent'
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invoice',
      error: error.message
    });
  }
};

/**
 * Cancel invoice
 * @route POST /api/invoices/:id/cancel
 * @access Private
 */
const cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await invoice.cancel();

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice cancelled'
    });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling invoice',
      error: error.message
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByStudent,
  getOverdueInvoices,
  sendInvoice,
  cancelInvoice
};