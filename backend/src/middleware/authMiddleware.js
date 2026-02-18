/**
 * Middleware d'authentification et d'autorisation
 * Gère la vérification des tokens et des rôles
 */

const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { AUTH_MESSAGES } = require('../constants/messages');
const { ROLES, ROLE_HIERARCHY } = require('../constants/roles');
const ApiError = require('../utils/ApiError');

/**
 * Extrait le token du header Authorization
 * @param {Object} req - Requête Express
 * @returns {string|null} Token JWT ou null
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Middleware de vérification d'authentification
 * Vérifie que l'utilisateur est connecté
 */
const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_REQUIRED);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: AUTH_MESSAGES.INVALID_TOKEN,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware de vérification des rôles
 * @param {...string} allowedRoles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Accès interdit pour ce rôle',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Middleware de vérification hiérarchique des rôles
 * Permet l'accès si le rôle de l'utilisateur est supérieur ou égal au rôle requis
 * @param {string} minRole - Rôle minimum requis
 * @returns {Function} Middleware Express
 */
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel < requiredLevel) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Privilèges insuffisants',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification
 * Authentifie l'utilisateur s'il y a un token, mais ne bloque pas si absent
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue sans authentification en cas d'erreur
    next();
  }
};

/**
 * Middleware de vérification de propriété
 * Vérifie que l'utilisateur est propriétaire de la ressource ou admin
 * @param {Function} getResourceOwner - Fonction pour récupérer le propriétaire
 */
const verifyOwnership = (getResourceOwner) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
      }

      // Admin peut tout faire
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      const ownerId = await getResourceOwner(req);

      if (req.user.id !== ownerId.toString()) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Accès interdit à cette ressource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  requireMinRole,
  optionalAuth,
  verifyOwnership,
  extractToken,
};
