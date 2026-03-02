const { createdResponse, asyncHandler, errorResponse } = require('../utils');

const productService    = require('../services/productService');
const VariantService  = require('../services/variantService');

const boutiqueController={

    findAllForUser: [
        asyncHandler(async (req, res) => {
            const { userId } = req.params;
            const result = await productService.findAllForUserReal(userId);
            if (!result.success) {
                return errorResponse(res, result.error, result.code || 500);
            }
            return res.status(200).json(result, 'Liste des produits filtrée récupérée avec succès');
        }),
    ],

    createVariant:[
        asyncHandler(async (req, res) => {
            // Parser les données JSON depuis le champ 'variantData' (FormData)
            let variantData= req.body;
            console.log("1. variant data 1 :"+ JSON.stringify(variantData) );
            // Récupérer les fichiers uploadés
            const files = req.files || [];

            const result = await VariantService.createVariant(variantData, files);
            if (!result.success) {
                return errorResponse(res, result.error,  500);
            }
            return res.status(200).json(result, 'Variant créé avec succès');
        }),
    ],

    updateVariant:[
        asyncHandler(async (req, res) => {
            // Parser les données JSON depuis le champ 'variantData' (FormData)
            let variantData;
            try {
                variantData = req.body.variantData ? JSON.parse(req.body.variantData) : req.body;
            } catch (e) {
                variantData = req.body;
            }

            // Récupérer les fichiers uploadés
            const files = req.files || [];

            const result = await VariantService.updateVariant(variantData, files);
            if (!result.success) {
                return errorResponse(res, result.error, result.code || 500);
            }
            return res.status(200).json(result, 'Variant mis à jour avec succès');
        }),
    ],

    deleteVariant:[
        asyncHandler(async (req, res) => {
            const { id} = req.params;
            const result = await VariantService.deleteVariant(id);
            return createdResponse(res, result, result.message);
        }),
    ]
};

module.exports = boutiqueController;