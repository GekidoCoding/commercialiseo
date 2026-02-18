/**
 * Utilitaires pour formater les réponses API de manière cohérente
 */

const { HTTP_STATUS } = require('../constants/httpStatus');

/**
 * Crée une réponse de succès standardisée
 */
const successResponse = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Crée une réponse de création réussie
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Crée une réponse de suppression réussie
 */
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return successResponse(res, null, message, HTTP_STATUS.OK);
};

/**
 * Crée une réponse paginée
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Crée une réponse d'erreur
 */
const errorResponse = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Crée une réponse de validation d'erreur
 */
const validationErrorResponse = (res, errors, message = 'Validation error') => {
  return errorResponse(res, message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
};

module.exports = {
  successResponse,
  createdResponse,
  deletedResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
};
