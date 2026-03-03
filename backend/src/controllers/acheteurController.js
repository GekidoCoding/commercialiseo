const productService    = require('../services/productService');
const reconstructService = require('../services/reconstructService');
const { createdResponse, asyncHandler, errorResponse } = require('../utils');

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
};

module.exports = acheteurController;
