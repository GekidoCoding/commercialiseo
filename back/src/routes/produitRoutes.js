/**
 * Routes des produits
 */

const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants/roles');

// Routes publiques
router.get('/', ...produitController.list);
router.get('/search', ...produitController.search);
router.get('/stats', ...produitController.getStats);
router.get('/:id', ...produitController.getById);

// Routes protégées (nécessitent authentification)
router.use(authenticate);

// Routes pour admin et boutique
router.post('/', authorize(ROLES.ADMIN, ROLES.BOUTIQUE), ...produitController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.BOUTIQUE), ...produitController.update);
router.patch('/:id/stock', authorize(ROLES.ADMIN, ROLES.BOUTIQUE), ...produitController.updateStock);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.BOUTIQUE), ...produitController.delete);

// Routes uniquement admin
router.delete('/:id/hard', authorize(ROLES.ADMIN), ...produitController.hardDelete);

module.exports = router;
