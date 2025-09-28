const express = require('express');
const cors = require('cors');
const session = require('express-session');
const corsConfig = require('../config/cors');
const { configureHelmet, configureRateLimit } = require('../config/security');
const sessionConfig = require('../config/session');

const configureMiddleware = (app) => {
  // Security headers
  app.use(configureHelmet());

  // CORS configuration
  const corsOptions = process.env.NODE_ENV === 'production' 
    ? corsConfig.production 
    : corsConfig.development;
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  app.use('/api/', configureRateLimit());

  // Session management
  app.use(session(sessionConfig));
};

module.exports = configureMiddleware;