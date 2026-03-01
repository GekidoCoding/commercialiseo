/**
 * Point d'entrée des routes
 * Regroupe et exporte toutes les routes de l'application
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const publicRoutes = require('./publicRoutes');

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API opérationnelle',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes API
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);

module.exports = router;
