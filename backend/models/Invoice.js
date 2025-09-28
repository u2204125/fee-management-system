/**
 * Invoice Model
 * Represents invoice documents generated for payments
 */

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  // Invoice identification
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Payment reference
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  
  // Student information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Financial details
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  paidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },
  
  // Invoice details
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  dueDate: {
    type: Date,
    required: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'paid'
  },
  
  // Payment details
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'online'],
    default: 'cash'
  },
  
  reference: {
    type: String,
    trim: true
  },
  
  receivedBy: {
    type: String,
    required: true,
    trim: true
  },
  
  // Monthly breakdown
  monthPayments: [{
    monthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Month',
      required: true
    },
    monthName: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  
  // Institution details for branding
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  
  institutionName: {
    type: String,
    required: true,
    trim: true
  },
  
  institutionAddress: {
    type: String,
    trim: true
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Tax information (for future use)
  taxDetails: {
    gstNumber: {
      type: String,
      trim: true
    },
    cgst: {
      type: Number,
      default: 0,
      min: 0
    },
    sgst: {
      type: Number,
      default: 0,
      min: 0
    },
    igst: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // File paths for generated invoices
  pdfPath: {
    type: String,
    trim: true
  },
  
  emailSent: {
    type: Boolean,
    default: false
  },
  
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ studentId: 1 });
invoiceSchema.index({ paymentId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ createdAt: -1 });

// Virtual for net amount (total - discount)
invoiceSchema.virtual('netAmount').get(function() {
  return this.totalAmount - this.discountAmount;
});

// Virtual for remaining balance
invoiceSchema.virtual('remainingBalance').get(function() {
  return Math.max(0, this.netAmount - this.paidAmount);
});

// Virtual for payment status
invoiceSchema.virtual('isPaid').get(function() {
  return this.paidAmount >= this.netAmount;
});

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && !this.isPaid;
});

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Auto-update status based on payment
  if (this.isPaid && this.status !== 'paid') {
    this.status = 'paid';
  } else if (this.isOverdue && this.status === 'sent') {
    this.status = 'overdue';
  }
  
  next();
});

// Instance methods
invoiceSchema.methods.markAsPaid = function(paidAmount, paymentMethod = 'cash') {
  this.paidAmount = paidAmount || this.netAmount;
  this.status = 'paid';
  this.paymentMethod = paymentMethod;
  return this.save();
};

invoiceSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

invoiceSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static methods
invoiceSchema.statics.generateInvoiceNumber = function() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV${year}${month}${random}`;
};

invoiceSchema.statics.findByStudent = function(studentId, options = {}) {
  const query = this.find({ studentId });
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.fromDate) {
    query.where('issueDate').gte(options.fromDate);
  }
  
  if (options.toDate) {
    query.where('issueDate').lte(options.toDate);
  }
  
  return query.populate('studentId', 'name studentId')
              .populate('institutionId', 'name address')
              .sort({ issueDate: -1 });
};

invoiceSchema.statics.getOverdueInvoices = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    dueDate: { $lt: today },
    status: { $in: ['sent', 'overdue'] }
  }).populate('studentId', 'name studentId phone guardianPhone')
    .populate('institutionId', 'name')
    .sort({ dueDate: 1 });
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;