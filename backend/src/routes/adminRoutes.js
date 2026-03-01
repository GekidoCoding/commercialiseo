/**
 * Routes d'admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {authenticate, authorize} = require("../middleware/authMiddleware");

// Applique à TOUTES les routes du router

router.use(authenticate);        // Vérifie le token
router.use(authorize('admin'));   // Vérifie le rôle (ici USER)

// Routes publiques
router.post('/create-product', ...adminController.createProduct);
router.put('/update-product', ...adminController.updateProduct);
router.get('/products', ...adminController.findAllProducts);


module.exports = router;


