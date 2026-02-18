/**
 * Routes d'authentification
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes publiques
router.post('/register-request', ...authController.registerRequest);
router.post('/verify-code', ...authController.verifyCode);
router.post('/login', ...authController.login);
router.post('/send-codePassword', ...authController.sendCodePassword);
router.post('/change-password', ...authController.changePassword);
router.post('/newAccessToken', ...authController.newAccessToken);

module.exports = router;
