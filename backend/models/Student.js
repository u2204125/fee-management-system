const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  startingMonthId: { type: mongoose.Schema.Types.ObjectId, ref: 'Month', required: true },
  endingMonthId: { type: mongoose.Schema.Types.ObjectId, ref: 'Month' }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  enrolledCourses: [courseEnrollmentSchema],
  guardianName: { type: String },
  guardianPhone: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
