/**
 * Routes d'admin
 */

const express = require('express');
const router = express.Router();
const acheteurController = require('../controllers/acheteurController');
const {authenticate, authorize} = require("../middleware/authMiddleware");

// Applique à TOUTES les routes du router

router.use(authenticate);        // Vérifie le token
router.use(authorize('acheteur'));   // Vérifie le rôle (ici USER)

// Routes publiques
router.get('/products/for-clients', ...acheteurController.findAllProducts);

// Route d'achat
router.post('/purchase', ...acheteurController.confirmPurchase);


module.exports = router;


