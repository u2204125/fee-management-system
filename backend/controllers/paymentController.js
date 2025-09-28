/**
 * Payment Controller
 * Handles payment management operations
 */

const Payment = require('../models/Payment');
const Student = require('../models/Student');
const { generateInvoiceNumber } = require('../utils/helpers');

/**
 * Get all payments
 * @route GET /api/payments
 * @access Private
 */
exports.getAllPayments = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Filter by institution if provided
    if (req.query.institution) {
      query.institution = req.query.institution;
    }
    
    // Filter by student if provided
    if (req.query.student) {
      query.student = req.query.student;
    }
    
    // Filter by batch if provided
    if (req.query.batch) {
      query.batch = req.query.batch;
    }
    
    // Filter by month if provided
    if (req.query.month) {
      query.month = req.query.month;
    }
    
    // Filter by payment date range
    if (req.query.startDate && req.query.endDate) {
      query.paymentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.paymentDate = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.paymentDate = { $lte: new Date(req.query.endDate) };
    }
    
    // Execute query with pagination
    const payments = await Payment.find(query)
      .populate('student', 'name studentId')
      .populate('institution', 'name')
      .populate('batch', 'name')
      .populate('month', 'name')
      .populate('receivedBy', 'name')
      .populate('createdBy', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Payment.countDocuments(query);
    
    // Return response
    res.json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
};

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 * @access Private
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'name studentId')
      .populate('institution', 'name')
      .populate('batch', 'name')
      .populate('month', 'name')
      .populate('receivedBy', 'name')
      .populate('createdBy', 'name');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment'
    });
  }
};

/**
 * Create new payment
 * @route POST /api/payments
 * @access Private
 */
exports.createPayment = async (req, res) => {
  try {
    const {
      student,
      institution,
      batch,
      month,
      amount,
      discount,
      paymentDate,
      receivedBy,
      paymentMethod,
      transactionId,
      notes,
      referenceBy
    } = req.body;
    
    // Verify student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    
    // Calculate net amount
    const discountAmount = discount || 0;
    const netAmount = amount - discountAmount;
    
    // Create new payment
    const payment = new Payment({
      student,
      institution,
      batch,
      month,
      invoiceNumber,
      amount,
      discount: discountAmount,
      netAmount,
      paymentDate: paymentDate || new Date(),
      receivedBy,
      paymentMethod,
      transactionId,
      notes,
      referenceBy,
      createdBy: req.user.id,
      createdAt: new Date()
    });
    
    await payment.save();
    
    // Return with populated fields
    const populatedPayment = await Payment.findById(payment._id)
      .populate('student', 'name studentId')
      .populate('institution', 'name')
      .populate('batch', 'name')
      .populate('month', 'name')
      .populate('receivedBy', 'name')
      .populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: populatedPayment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment'
    });
  }
};

/**
 * Update payment
 * @route PUT /api/payments/:id
 * @access Private
 */
exports.updatePayment = async (req, res) => {
  try {
    const {
      amount,
      discount,
      paymentDate,
      receivedBy,
      paymentMethod,
      transactionId,
      notes,
      referenceBy
    } = req.body;
    
    // Find payment
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update fields
    if (amount !== undefined) {
      payment.amount = amount;
      // Recalculate net amount
      payment.netAmount = amount - (payment.discount || 0);
    }
    
    if (discount !== undefined) {
      payment.discount = discount;
      // Recalculate net amount
      payment.netAmount = payment.amount - discount;
    }
    
    if (paymentDate) payment.paymentDate = paymentDate;
    if (receivedBy) payment.receivedBy = receivedBy;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId !== undefined) payment.transactionId = transactionId;
    if (notes !== undefined) payment.notes = notes;
    if (referenceBy !== undefined) payment.referenceBy = referenceBy;
    
    payment.updatedBy = req.user.id;
    payment.updatedAt = new Date();
    
    await payment.save();
    
    // Return with populated fields
    const updatedPayment = await Payment.findById(payment._id)
      .populate('student', 'name studentId')
      .populate('institution', 'name')
      .populate('batch', 'name')
      .populate('month', 'name')
      .populate('receivedBy', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment'
    });
  }
};

/**
 * Delete payment
 * @route DELETE /api/payments/:id
 * @access Private
 */
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    await payment.remove();
    
    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting payment'
    });
  }
};