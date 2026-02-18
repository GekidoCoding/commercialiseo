/**
 * Middleware de gestion globale des erreurs
 * Capture toutes les erreurs et les formate de manière cohérente
 */

const { HTTP_STATUS } = require('../constants/httpStatus');
const { COMMON_MESSAGES } = require('../constants/messages');
const ApiError = require('../utils/ApiError');

/**
 * Middleware pour gérer les routes non trouvées
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} non trouvée`
  );
  next(error);
};

/**
 * Middleware principal de gestion des erreurs
 * Doit être le dernier middleware dans la chaîne
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Si ce n'est pas une ApiError, la convertir
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || COMMON_MESSAGES.INTERNAL_ERROR;
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log l'erreur (en développement ou pour les erreurs serveur)
  if (process.env.NODE_ENV === 'development' || error.statusCode >= 500) {
    console.error('❌ Erreur:', {
      statusCode: error.statusCode,
      message: error.message,
      path: req.path,
      method: req.method,
      stack: error.stack,
    });
  }

  // Réponse à l'client
  const response = {
    success: false,
    message: error.message,
    timestamp: new Date().toISOString(),
  };

  // Ajouter les détails en mode développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.error = err;
  }

  // Gestion spécifique des erreurs Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: COMMON_MESSAGES.VALIDATION_ERROR,
      errors: messages,
      timestamp: new Date().toISOString(),
    });
  }

  // Gestion des doublons MongoDB (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `${field} existe déjà`,
      timestamp: new Date().toISOString(),
    });
  }

  // Gestion des erreurs de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Format invalide pour le champ ${err.path}: ${err.value}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token invalide',
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token expiré',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(error.statusCode).json(response);
};

/**
 * Middleware pour gérer les erreurs async non capturées
 * (Alternative à asyncHandler pour les cas spéciaux)
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncErrorHandler,
};
