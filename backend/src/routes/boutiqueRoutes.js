/**
 * Routes de boutique
 */

const express = require('express');
const router = express.Router();
const {authenticate, authorize} = require("../middleware/authMiddleware");
const { handleUpload } = require("../middleware/uploadMiddleware");
const boutiqueController = require('../controllers/boutiqueController');
// Applique à TOUTES les routes du router
router.use(authenticate);        // Vérifie le token
router.use(authorize('boutique'));   // Vérifie le rôle (ici USER)
// Routes publiques
router.get('/products/user/:userId', ...boutiqueController.findAllForUser);
router.post('/create-variant', handleUpload, ...boutiqueController.createVariant);
router.put('/update-variant', handleUpload, ...boutiqueController.updateVariant);
router.delete('/delete-variant/:id', ...boutiqueController.deleteVariant);

router.post('/create-promotion', handleUpload, ...boutiqueController.createPromotion);
router.put('/update-promotion', handleUpload, ...boutiqueController.updatePromotion);
router.delete('/delete-promotion/:id', ...boutiqueController.deletePromotion);

module.exports = router;