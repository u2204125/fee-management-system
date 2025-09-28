/**
 * Input validation middleware using express-validator
 */
const { validationResult } = require('express-validator');

/**
 * Middleware to validate request inputs based on provided rules
 * @param {Array} validationRules - Array of express-validator validation rules
 * @returns {Function} - Express middleware function
 */
exports.validate = (validationRules) => {
  return async (req, res, next) => {
    // Apply all validation rules
    for (let validation of validationRules) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

/**
 * Sanitize request data to prevent XSS attacks
 */
exports.sanitizeXss = (req, res, next) => {
  if (req.body) {
    // Recursive function to sanitize objects
    const sanitize = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          // Replace potentially dangerous characters
          obj[key] = obj[key]
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      });
    };
    
    sanitize(req.body);
  }
  
  next();
};

/**
 * Rate limiting middleware for sensitive routes
 * @param {Object} limiterOptions - Options for the rate limiter
 */
exports.rateLimiter = (limiterOptions = {}) => {
  const rateLimit = require('express-rate-limit');
  
  // Default settings
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after a while',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  };
  
  // Merge default options with provided options
  const options = { ...defaultOptions, ...limiterOptions };
  
  return rateLimit(options);
};

/**
 * Content Security Policy middleware
 */
exports.setCSP = (req, res, next) => {
  // Set Content Security Policy headers
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Can be tightened in production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "frame-src 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);
  next();
};

/**
 * No Cache middleware for sensitive routes
 */
exports.noCache = (req, res, next) => {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};