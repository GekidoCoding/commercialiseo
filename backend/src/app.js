/**
 * Configuration de l'application Express
 * Sépare la configuration du serveur du démarrage
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { sanitize } = require('./middleware/validationMiddleware');

const app = express();

// Faire confiance au proxy (nécessaire pour Render et autres PaaS)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization
app.use(sanitize);

// Request logging (development only)
if (process.env.NODE_ENV === 'developpement') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Servir les fichiers statiques (photos)
app.use('/images', express.static(path.join(__dirname, '../images')));

// API routes
app.use('/api', routes);

// Health check route (also available at root)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Commercialiseo API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
