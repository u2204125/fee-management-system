const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const serverless = require('serverless-http');

// Import routes
const authRoutes = require('../../routes/auth');
const usersRoutes = require('../../routes/users');
const studentsRoutes = require('../../routes/students');
const institutionsRoutes = require('../../routes/institutions');
const batchesRoutes = require('../../routes/batches');
const coursesRoutes = require('../../routes/courses');
const monthsRoutes = require('../../routes/months');
const paymentsRoutes = require('../../routes/payments');
const referenceOptionsRoutes = require('../../routes/reference-options');
const receivedByOptionsRoutes = require('../../routes/received-by-options');

const app = express();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/btf-fms';

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Netlify
app.use(session({
  secret: process.env.SESSION_SECRET || 'btf-fms-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/students', studentsRoutes);
app.use('/institutions', institutionsRoutes);
app.use('/batches', batchesRoutes);
app.use('/courses', coursesRoutes);
app.use('/months', monthsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/reference-options', referenceOptionsRoutes);
app.use('/received-by-options', receivedByOptionsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
