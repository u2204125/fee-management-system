/**
 * Authentication Controller
 * Handles user login, session management, and logout
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      username: user.username,
      role: user.role
    }, 
    process.env.JWT_SECRET || 'your-fallback-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

/**
 * Login user and create session
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Check password - handle both hashed and plain text for demo
    let isValidPassword = false;
    if (user.password.startsWith('$2')) {
      // Hashed password
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (for demo users)
      isValidPassword = password === user.password;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Store user in session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name
    };
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          success: false,
          message: 'Session save failed' 
        });
      }
      
      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name
        },
        token
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

/**
 * Check current user session
 * @route GET /api/auth/session
 * @access Public
 */
exports.getSession = (req, res) => {
  if (req.session.user) {
    res.json({ 
      success: true,
      user: req.session.user 
    });
  } else {
    res.status(401).json({ 
      success: false,
      message: 'Not authenticated' 
    });
  }
};

/**
 * Logout user and destroy session
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Could not log out' 
      });
    }
    
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  });
};

/**
 * Register new user (Admin only)
 * @route POST /api/auth/register
 * @access Private (Admin)
 */
exports.register = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role: role || 'user',
      isActive: true,
      createdAt: new Date()
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};