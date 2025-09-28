const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  paidAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
  discountApplicableMonths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Month' }],
  months: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Month' }], // legacy
  monthPayments: [{
    monthId: { type: mongoose.Schema.Types.ObjectId, ref: 'Month' },
    paidAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    monthFee: { type: Number }
  }],
  paymentMethod: { type: String },
  reference: { type: String },
  receivedBy: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
