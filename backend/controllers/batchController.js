/**
 * Batch Controller
 * Handles batch management operations
 */

const Batch = require('../models/Batch');
const Student = require('../models/Student');

/**
 * Get all batches
 * @route GET /api/batches
 * @access Private
 */
exports.getAllBatches = async (req, res) => {
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
    
    // Filter by name if provided
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }
    
    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Execute query with pagination
    const batches = await Batch.find(query)
      .populate('institution', 'name')
      .populate('course', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Batch.countDocuments(query);
    
    // Return response
    res.json({
      success: true,
      count: batches.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      data: batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching batches'
    });
  }
};

/**
 * Get batch by ID
 * @route GET /api/batches/:id
 * @access Private
 */
exports.getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('institution', 'name')
      .populate('course', 'name');
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Count students in this batch
    const studentCount = await Student.countDocuments({ batch: batch._id });
    
    // Add student count to response
    const batchWithCount = {
      ...batch.toObject(),
      studentCount
    };
    
    res.json({
      success: true,
      data: batchWithCount
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching batch'
    });
  }
};

/**
 * Create new batch
 * @route POST /api/batches
 * @access Private
 */
exports.createBatch = async (req, res) => {
  try {
    const {
      name,
      institution,
      course,
      feeAmount,
      startDate,
      endDate,
      schedule,
      notes
    } = req.body;
    
    // Check if batch already exists with same name in same institution
    const existingBatch = await Batch.findOne({
      name,
      institution
    });
    
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'A batch with this name already exists in this institution'
      });
    }
    
    // Create new batch
    const batch = new Batch({
      name,
      institution,
      course,
      feeAmount,
      startDate,
      endDate,
      schedule,
      notes,
      isActive: true,
      createdBy: req.user.id,
      createdAt: new Date()
    });
    
    await batch.save();
    
    // Return with populated fields
    const populatedBatch = await Batch.findById(batch._id)
      .populate('institution', 'name')
      .populate('course', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: populatedBatch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating batch'
    });
  }
};

/**
 * Update batch
 * @route PUT /api/batches/:id
 * @access Private
 */
exports.updateBatch = async (req, res) => {
  try {
    const {
      name,
      institution,
      course,
      feeAmount,
      startDate,
      endDate,
      schedule,
      notes,
      isActive
    } = req.body;
    
    // Find batch
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // If changing name or institution, check if it conflicts
    if ((name && name !== batch.name) || 
        (institution && institution !== batch.institution.toString())) {
      
      const conflictBatch = await Batch.findOne({
        name: name || batch.name,
        institution: institution || batch.institution,
        _id: { $ne: batch._id }
      });
      
      if (conflictBatch) {
        return res.status(400).json({
          success: false,
          message: 'A batch with this name already exists in this institution'
        });
      }
    }
    
    // Update fields
    if (name) batch.name = name;
    if (institution) batch.institution = institution;
    if (course) batch.course = course;
    if (feeAmount) batch.feeAmount = feeAmount;
    if (startDate) batch.startDate = startDate;
    if (endDate) batch.endDate = endDate;
    if (schedule) batch.schedule = schedule;
    if (notes !== undefined) batch.notes = notes;
    if (typeof isActive === 'boolean') batch.isActive = isActive;
    
    batch.updatedBy = req.user.id;
    batch.updatedAt = new Date();
    
    await batch.save();
    
    // Return with populated fields
    const updatedBatch = await Batch.findById(batch._id)
      .populate('institution', 'name')
      .populate('course', 'name');
    
    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating batch'
    });
  }
};

/**
 * Delete batch
 * @route DELETE /api/batches/:id
 * @access Private
 */
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Check if there are any students in this batch
    const studentCount = await Student.countDocuments({ batch: batch._id });
    
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch because it has ${studentCount} students. Reassign students first.`
      });
    }
    
    await batch.remove();
    
    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting batch'
    });
  }
};