/**
 * Utils Index
 * Exporte tous les utilitaires
 */

const ApiError = require('./ApiError');
const { asyncHandler, asyncHandlerWithCustomError } = require('./asyncHandler');
const {
  successResponse,
  createdResponse,
  deletedResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
} = require('./responseHandler');
const { generateCode, generateNumericCode, generateAlphanumericCode, generateResetToken } = require('./generateCode');

module.exports = {
  // Errors
  ApiError,

  // Handlers
  asyncHandler,
  asyncHandlerWithCustomError,

  // Responses
  successResponse,
  createdResponse,
  deletedResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,

  // Generators
  generateCode,
  generateNumericCode,
  generateAlphanumericCode,
  generateResetToken,
};
