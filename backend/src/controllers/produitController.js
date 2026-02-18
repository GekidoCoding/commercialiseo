/**
 * Contrôleur des produits
 * Gère les requêtes HTTP liées aux produits
 */

const produitService = require('../services/produitService');
const produitValidation = require('../validations/produitValidation');
const { asyncHandler } = require('../utils/asyncHandler');
const { validate, validateMultiple } = require('../middleware/validationMiddleware');
const { successResponse, createdResponse, deletedResponse, paginatedResponse } = require('../utils/responseHandler');

const produitController = {
  /**
   * POST /api/produits
   * Crée un nouveau produit
   */
  create: [
    validate(produitValidation.create),
    asyncHandler(async (req, res) => {
      const userId = req.user?.id;
      const result = await produitService.create(req.body, userId);
      return createdResponse(res, result, result.message);
    }),
  ],

  /**
   * GET /api/produits
   * Liste tous les produits avec pagination
   */
  list: [
    validate(produitValidation.search, 'query'),
    asyncHandler(async (req, res) => {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        categorie: req.query.categorie,
        enStock: req.query.enStock === 'true',
        prixMin: req.query.prixMin ? parseFloat(req.query.prixMin) : undefined,
        prixMax: req.query.prixMax ? parseFloat(req.query.prixMax) : undefined,
        q: req.query.q,
        sort: req.query.sort,
      };

      const result = await produitService.findAll(options);

      return paginatedResponse(res, result.produits, result.pagination, 'Produits récupérés avec succès');
    }),
  ],

  /**
   * GET /api/produits/:id
   * Récupère un produit par son ID
   */
  getById: [
    validate(produitValidation.id, 'params'),
    asyncHandler(async (req, res) => {
      const produit = await produitService.findSummaryById(req.params.id);
      return successResponse(res, { produit }, 'Produit récupéré avec succès');
    }),
  ],

  /**
   * PUT /api/produits/:id
   * Met à jour un produit
   */
  update: [
    validateMultiple({
      params: produitValidation.id,
      body: produitValidation.update,
    }),
    asyncHandler(async (req, res) => {
      const result = await produitService.update(req.params.id, req.body);
      return successResponse(res, result, result.message);
    }),
  ],

  /**
   * DELETE /api/produits/:id
   * Supprime un produit (soft delete)
   */
  delete: [
    validate(produitValidation.id, 'params'),
    asyncHandler(async (req, res) => {
      const result = await produitService.delete(req.params.id);
      return deletedResponse(res, result.message);
    }),
  ],

  /**
   * DELETE /api/produits/:id/hard
   * Supprime définitivement un produit
   */
  hardDelete: [
    validate(produitValidation.id, 'params'),
    asyncHandler(async (req, res) => {
      const result = await produitService.hardDelete(req.params.id);
      return deletedResponse(res, result.message);
    }),
  ],

  /**
   * GET /api/produits/search
   * Recherche des produits
   */
  search: [
    asyncHandler(async (req, res) => {
      const { q, categorie, enStock, limit } = req.query;
      const produits = await produitService.search(q, {
        categorie,
        enStock: enStock === 'true',
        limit: limit ? parseInt(limit) : 20,
      });
      return successResponse(res, { produits, count: produits.length }, 'Résultats de recherche');
    }),
  ],

  /**
   * GET /api/produits/stats
   * Récupère les statistiques des produits
   */
  getStats: [
    asyncHandler(async (req, res) => {
      const stats = await produitService.getStats();
      return successResponse(res, stats, 'Statistiques récupérées avec succès');
    }),
  ],

  /**
   * PATCH /api/produits/:id/stock
   * Met à jour le stock d'un produit
   */
  updateStock: [
    validate(produitValidation.id, 'params'),
    asyncHandler(async (req, res) => {
      const { quantite, operation } = req.body;
      const result = await produitService.updateStock(req.params.id, quantite, operation);
      return successResponse(res, { produit: result }, 'Stock mis à jour avec succès');
    }),
  ],
};

module.exports = produitController;
