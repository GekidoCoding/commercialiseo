const productService    = require('../services/productService');
const reconstructService = require('../services/reconstructService');
const { createdResponse, asyncHandler, errorResponse } = require('../utils');

const adminController = {
    /**
     * POST /api/admin/create-product
     * Création de product
     */
    createProduct: [
        asyncHandler(async (req, res) => {
            const { name, categoryId, code, specs, releaseDate } = req.body;

            const result = await productService.createProduct({
                name, categoryId, code, specs, releaseDate
            });

            if (!result.success) {
                return errorResponse(res, result.error, result.code || 500);
            }

            //  On répond immédiatement à l'utilisateur
            createdResponse(res, result.data, result.message);

            //  Reconstruction asynchrone APRÈS la réponse (non bloquant)
            reconstructService
                .reconstructSingleProduct(result.data._id)
                .catch(err => console.error('[Reconstruct] createProduct failed:', err));
        }),
    ],

    /**
     * POST /api/admin/update-product
     * Mise à jour de product
     */
    updateProduct: [
        asyncHandler(async (req, res) => {
            const { name, categoryId, code, specs, releaseDate } = req.body;

            const result = await productService.updateProduct({
                name, categoryId, code, specs, releaseDate
            });

            if (!result.success) {
                return errorResponse(res, result.error, result.code || 500);
            }

            //  On répond immédiatement à l'utilisateur
            createdResponse(res, result.data, result.message);

            //  Reconstruction asynchrone APRÈS la réponse (non bloquant)
            reconstructService
                .reconstructSingleProduct(result.data._id)
                .catch(err => console.error('[Reconstruct] updateProduct failed:', err));
        }),
    ],

    /**
     * POST /api/admin/products
     * Liste de tous les produits
     */
    findAllProducts: [
        asyncHandler(async (req, res) => {
            const result = await productService.findAll();
            if (!result.success) {
                return errorResponse(res, result.error, result.code || 500);
            }
            return res.status(200).json(result, 'Liste des produits récupérée avec succès');
        }),
    ],
};

module.exports = adminController;