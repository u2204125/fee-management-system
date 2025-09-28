/**
 * Custom error handler middleware
 */

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Indicates this is an expected operational error
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware to handle 404 errors
const notFound = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Central error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default status code and error structure
  let statusCode = err.statusCode || 500;
  let errorResponse = {
    success: false,
    message: err.message || 'Server Error',
  };
  
  // Add detailed errors if available
  if (err.errors && err.errors.length > 0) {
    errorResponse.errors = err.errors;
  }
  
  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.message = 'Validation Error';
    errorResponse.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.message = `Invalid ${err.path}: ${err.value}`;
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    errorResponse.message = 'Duplicate field value entered';
    const field = Object.keys(err.keyValue)[0];
    errorResponse.errors = [{
      field,
      message: `${field} already exists`
    }];
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.message = 'Token expired';
  }
  
  // Log server errors
  if (statusCode >= 500) {
    console.error('Server error:', err);
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  ApiError,
  notFound,
  errorHandler
};