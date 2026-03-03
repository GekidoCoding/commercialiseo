const productService    = require('../services/productService');
const reconstructService = require('../services/reconstructService');
const acheteurService = require('../services/acheteurService');
const { createdResponse, asyncHandler, errorResponse, successResponse } = require('../utils');

const acheteurController = {
    findAllProducts: [
        asyncHandler(async (req, res) => {
            const result = await productService.findAll();
            if (!result.success) {
                return errorResponse(res, result.error, result.code || 500);
            }
            return res.status(200).json(result, 'Liste des produits récupérée avec succès');
        }),
    ],

    confirmPurchase: [
        asyncHandler(async (req, res) => {
            const { acheteurId, password, variants } = req.body;

            const result = await acheteurService.confirmPurchase(acheteurId, password, variants);

            // Reconstruction du read model pour chaque produit modifié (hors transaction)
            if (result.productIdsToReconstruct && result.productIdsToReconstruct.length > 0) {
                for (const productId of result.productIdsToReconstruct) {
                    await reconstructService.reconstructSingleProduct(productId);
                }
            }

            return successResponse(res, { message: result.message, success: result.success }, result.message);
        }),
    ],
};

module.exports = acheteurController;
