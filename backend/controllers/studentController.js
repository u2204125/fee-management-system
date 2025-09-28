/**
 * Student Controller
 * Handles student management operations
 */

const Student = require('../models/Student');

/**
 * Get all students
 * @route GET /api/students
 * @access Private
 */
exports.getAllStudents = async (req, res) => {
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
    
    // Filter by batch if provided
    if (req.query.batch) {
      query.batch = req.query.batch;
    }
    
    // Filter by name if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }
    
    // Filter by studentId if provided
    if (req.query.studentId) {
      query.studentId = { $regex: req.query.studentId, $options: 'i' };
    }
    
    // Filter by phone if provided
    if (req.query.phone) {
      query.phone = { $regex: req.query.phone, $options: 'i' };
    }
    
    // Execute query with pagination
    const students = await Student.find(query)
      .populate('institution', 'name')
      .populate('batch', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Student.countDocuments(query);
    
    // Return response
    res.json({
      success: true,
      count: students.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching students'
    });
  }
};

/**
 * Get student by ID
 * @route GET /api/students/:id
 * @access Private
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('institution', 'name')
      .populate('batch', 'name');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student'
    });
  }
};

/**
 * Create new student
 * @route POST /api/students
 * @access Private
 */
exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      studentId,
      institution,
      batch,
      phone,
      email,
      parentPhone,
      address,
      notes
    } = req.body;
    
    // Check if student already exists with same ID in same institution
    const existingStudent = await Student.findOne({
      studentId,
      institution
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this ID already exists in this institution'
      });
    }
    
    // Create new student
    const student = new Student({
      name,
      studentId,
      institution,
      batch,
      phone,
      email,
      parentPhone,
      address,
      notes,
      isActive: true,
      createdBy: req.user.id,
      createdAt: new Date()
    });
    
    await student.save();
    
    // Return with populated fields
    const populatedStudent = await Student.findById(student._id)
      .populate('institution', 'name')
      .populate('batch', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating student'
    });
  }
};

/**
 * Update student
 * @route PUT /api/students/:id
 * @access Private
 */
exports.updateStudent = async (req, res) => {
  try {
    const {
      name,
      studentId,
      institution,
      batch,
      phone,
      email,
      parentPhone,
      address,
      notes,
      isActive
    } = req.body;
    
    // Find student
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // If changing studentId or institution, check if it conflicts
    if ((studentId && studentId !== student.studentId) || 
        (institution && institution !== student.institution.toString())) {
      
      const conflictStudent = await Student.findOne({
        studentId: studentId || student.studentId,
        institution: institution || student.institution,
        _id: { $ne: student._id }
      });
      
      if (conflictStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this ID already exists in this institution'
        });
      }
    }
    
    // Update fields
    if (name) student.name = name;
    if (studentId) student.studentId = studentId;
    if (institution) student.institution = institution;
    if (batch) student.batch = batch;
    if (phone) student.phone = phone;
    if (email) student.email = email;
    if (parentPhone) student.parentPhone = parentPhone;
    if (address) student.address = address;
    if (notes !== undefined) student.notes = notes;
    if (typeof isActive === 'boolean') student.isActive = isActive;
    
    student.updatedBy = req.user.id;
    student.updatedAt = new Date();
    
    await student.save();
    
    // Return with populated fields
    const updatedStudent = await Student.findById(student._id)
      .populate('institution', 'name')
      .populate('batch', 'name');
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating student'
    });
  }
};

/**
 * Delete student
 * @route DELETE /api/students/:id
 * @access Private
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await student.remove();
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting student'
    });
  }
};