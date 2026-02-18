/**
 * Wrapper pour les fonctions async des controllers
 * Élimine le besoin de try/catch répétitif dans chaque controller
 * 
 * Usage: router.get('/', asyncHandler(controller.method))
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wrapper pour les fonctions async avec gestion personnalisée
 * Permet de spécifier un gestionnaire d'erreur spécifique
 */
const asyncHandlerWithCustomError = (fn, errorHandler) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (errorHandler) {
        errorHandler(error, req, res, next);
      } else {
        next(error);
      }
    });
  };
};

module.exports = {
  asyncHandler,
  asyncHandlerWithCustomError,
};
