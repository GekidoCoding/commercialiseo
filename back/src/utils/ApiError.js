/**
 * Classe d'erreur API personnalisée
 * Permet une gestion cohérente des erreurs avec statut HTTP et message
 */

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Crée une erreur 400 Bad Request
   */
  static badRequest(message) {
    return new ApiError(400, message);
  }

  /**
   * Crée une erreur 401 Unauthorized
   */
  static unauthorized(message = 'Non autorisé') {
    return new ApiError(401, message);
  }

  /**
   * Crée une erreur 403 Forbidden
   */
  static forbidden(message = 'Accès interdit') {
    return new ApiError(403, message);
  }

  /**
   * Crée une erreur 404 Not Found
   */
  static notFound(message = 'Ressource non trouvée') {
    return new ApiError(404, message);
  }

  /**
   * Crée une erreur 409 Conflict
   */
  static conflict(message) {
    return new ApiError(409, message);
  }

  /**
   * Crée une erreur 422 Unprocessable Entity
   */
  static validationError(message) {
    return new ApiError(422, message);
  }

  /**
   * Crée une erreur 500 Internal Server Error
   */
  static internal(message = 'Erreur serveur interne') {
    return new ApiError(500, message, true);
  }

  /**
   * Convertit l'erreur en objet JSON pour la réponse
   */
  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

module.exports = ApiError;
