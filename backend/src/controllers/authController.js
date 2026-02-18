/**
 * Contrôleur d'authentification
 * Gère les requêtes HTTP liées à l'authentification
 */

const authService = require('../services/authService');
const authValidation = require('../validations/authValidation');
const { asyncHandler } = require('../utils/asyncHandler');
const { validate } = require('../middleware/validationMiddleware');
const { successResponse, createdResponse } = require('../utils/responseHandler');

const authController = {
  /**
   * POST /api/auth/register-request
   * Demande d'inscription - envoie un code de vérification
   */
  registerRequest: [
    validate(authValidation.registerRequest),
    asyncHandler(async (req, res) => {
      const { email, username, password, role } = req.body;
      const result = await authService.registerRequest(email, username, password, role);
      return createdResponse(res, result, result.message);
    }),
  ],

  /**
   * POST /api/auth/verify-code
   * Vérifie le code et active le compte
   */
  verifyCode: [
    validate(authValidation.verifyCode),
    asyncHandler(async (req, res) => {
      const { email, code } = req.body;
      const result = await authService.verifyCode(email, code);
      return successResponse(res, result, result.message);
    }),
  ],

  /**
   * POST /api/auth/send-codePassword
   * Envoie un code de récupération de mot de passe
   */
  sendCodePassword: [
    validate(authValidation.sendCodePassword),
    asyncHandler(async (req, res) => {
      const { email, isPasswordUpdate } = req.body;
      const result = await authService.sendPasswordResetCode(email, isPasswordUpdate);
      return successResponse(res, result, result.message);
    }),
  ],

  /**
   * POST /api/auth/change-password
   * Change le mot de passe avec un code de vérification
   */
  changePassword: [
    validate(authValidation.changePassword),
    asyncHandler(async (req, res) => {
      const { email, password, code } = req.body;
      const result = await authService.changePasswordWithCode(email, password, code);
      return successResponse(res, result, result.message);
    }),
  ],

  /**
   * POST /api/auth/login
   * Connexion utilisateur
   */
  login: [
    validate(authValidation.login),
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return successResponse(res, result, result.message);
    }),
  ],

  /**
   * POST /api/auth/newAccessToken
   * Rafraîchit le token d'accès
   */
  newAccessToken: [
    validate(authValidation.newAccessToken),
    asyncHandler(async (req, res) => {
      const { email } = req.body;
      const result = await authService.refreshToken(email);
      return successResponse(res, result, result.message);
    }),
  ],

  getPayloadToken: [
    asyncHandler(async (req, res) => {
      const { token } = req.body;
      const result = await authService.verifyToken(token);
      return successResponse(res, result, result.message);
    }),
  ],


};

module.exports = authController;
