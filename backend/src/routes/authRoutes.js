/**
 * Routes d'authentification
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const {authenticate, authorize} = require("../middleware/authMiddleware");

// Applique à TOUTES les routes du router
// router.use(authenticate);        // Vérifie le token
// router.use(authorize('admin'));   // Vérifie le rôle (ici USER)

// Routes publiques
router.post('/register-request', ...authController.registerRequest);
router.post('/verify-code', ...authController.verifyCode);
router.post('/login', ...authController.login);
router.post('/send-codePassword', ...authController.sendCodePassword);
router.post('/change-password', ...authController.changePassword);
router.post('/newAccessToken', ...authController.newAccessToken);
router.post('/verify-token', ...authController.getPayloadToken);

module.exports = router;


