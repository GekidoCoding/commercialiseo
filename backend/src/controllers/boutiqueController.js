const { createdResponse, asyncHandler, errorResponse } = require('../utils');

const productService    = require('../services/productService');
const VariantService  = require('../services/variantService');
const reconstructService = require("../services/reconstructService");

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
            //  On répond immédiatement à l'utilisateur
            createdResponse(res, result.data, result.message);

            //  Reconstruction asynchrone APRÈS la réponse (non bloquant)
            console.log("reconstruct after create variant:"+result.data);
            reconstructService
                .reconstructSingleProduct(result.data.productId)
                .catch(err => console.error('[Reconstruct] updateProduct failed:', err));
        }),
    ],

    updateVariant:[
        asyncHandler(async (req, res) => {
            // Parser les données JSON depuis le champ 'variantData' (FormData)
            let variantData =  JSON.parse(req.body.variant) ;
            console.log("1. variantData in controller in update variant :"+ JSON.stringify(variantData));
            // Récupérer les fichiers uploadés
            const files = req.files || [];

            const result = await VariantService.updateVariant(variantData, files);
            if (!result.success) {
                return errorResponse(res, result.error, 500);
            }
            //  On répond immédiatement à l'utilisateur
            createdResponse(res, result.data, result.message);

            //  Reconstruction asynchrone APRÈS la réponse (non bloquant)
            reconstructService
                .reconstructSingleProduct(result.data.productId)
                .catch(err => console.error('[Reconstruct] updateProduct failed:', err));
        }),
    ],

    deleteVariant:[
        asyncHandler(async (req, res) => {
            const { id} = req.params;
            const result = await VariantService.deleteVariant(id);
            //  On répond immédiatement à l'utilisateur
            console.log("delete variant result:"+JSON.stringify(result));
            createdResponse(res, result.data, 'Variant supprimee avec succes');

            //  Reconstruction asynchrone APRÈS la réponse (non bloquant)
            reconstructService
                .reconstructSingleProduct(result.data.productId)
                .catch(err => console.error('[Reconstruct] updateProduct failed:', err));
        }),
    ]
};

module.exports = boutiqueController;