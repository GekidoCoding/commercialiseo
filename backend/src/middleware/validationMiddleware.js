/**
 * Middleware de validation des requêtes
 * Utilise Joi pour valider les données entrantes
 */

const Joi = require('joi');
const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Crée un middleware de validation
 * @param {Joi.Schema} schema - Schéma Joi à valider
 * @param {string} [source='body'] - Source des données (body, query, params)
 * @returns {Function} Middleware Express
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Erreur de validation',
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Remplace les données par les valeurs validées et transformées
    req[source] = value;
    next();
  };
};

/**
 * Valide plusieurs sources en une fois
 * @param {Object} schemas - Objet avec les schémas pour chaque source
 * @returns {Function} Middleware Express
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const [source, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          source,
          field: detail.path.join('.'),
          message: detail.message,
        }));
        allErrors.push(...errors);
      } else {
        req[source] = value;
      }
    }

    if (allErrors.length > 0) {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Erreur de validation',
        errors: allErrors,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Middleware de sanitization basique
 * Nettoie les entrées utilisateur
 */
const sanitize = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

module.exports = {
  validate,
  validateMultiple,
  sanitize,
};
