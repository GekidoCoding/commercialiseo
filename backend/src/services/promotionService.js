const {Promotion, Variant} = require("../models");

class PromotionService{
    async createPromotion(promotionData) {
        try {
            const data = { ...promotionData };

            const hasDuration = data.duration !== undefined && data.duration !== null && data.duration !== 0;
            const hasDateBegin = data.dateBegin !== undefined && data.dateBegin !== null;
            const hasDateEnd = data.dateEnd !== undefined && data.dateEnd !== null;

            if (!hasDuration && hasDateBegin && hasDateEnd) {
                const begin = new Date(data.dateBegin);
                const end = new Date(data.dateEnd);
                const diffMs = end - begin;
                data.duration = Math.ceil(diffMs / (1000 * 60 * 60));
            } else if (hasDuration && !hasDateBegin && !hasDateEnd) {
                const now = new Date();
                data.dateBegin = now;
                data.dateEnd = new Date(now.getTime() + (data.duration * 60 * 60 * 1000));
            }

            const promotion = new Promotion(data);
            await promotion.save();

            const variant = await Variant.findById(promotion.variantId);
            if (!variant) {
                return { success: false, error: 'Variant lié introuvable', code: 'VARIANT_NOT_FOUND' };
            }

            return {
                success: true,
                data: { productId: variant.productId },
                message: 'Promotion créée avec succès'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Erreur inconnue',
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }

    async updatePromotion(promotionData) {
        try {
            const { _id, ...updateData } = promotionData;

            // Nettoyer les valeurs undefined/0/vides venant du frontend
            Object.keys(updateData).forEach(key => {
                const value = updateData[key];
                if (value === undefined || value === 'undefined' || value === '') {
                    delete updateData[key];
                }
            });

            // Pour update, on applique les champs tels quels sans recalcul automatique
            const promotion = await Promotion.findByIdAndUpdate(
                _id,
                updateData,
                { new: true, runValidators: true } // retourne le document mis à jour
            );

            if (!promotion) {
                return { success: false, error: 'Promotion non trouvée', code: 'NOT_FOUND' };
            }

            // Vérifier le variant pour récupérer productId
            const variant = await Variant.findById(promotion.variantId);
            if (!variant) {
                return { success: false, error: 'Variant lié introuvable', code: 'VARIANT_NOT_FOUND' };
            }

            return {
                success: true,
                data: { productId: variant.productId },
                message: 'Promotion mise à jour avec succès'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Erreur inconnue',
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }
    async deletePromotion(id) {
        try {
            // Vérifier si la promotion existe
            const existingPromotion = await Promotion.findById(id);
            if (!existingPromotion) {
                return { success: false, error: 'Promotion non trouvée', code: 'NOT_FOUND' };
            }

            const variantId = existingPromotion.variantId;
            if (!variantId) {
                return { success: false, error: 'Variant lié à cette promotion non trouvé', code: 'VARIANT_NOT_FOUND' };
            }

            // Vérifier si le variant existe
            const variantProduct = await Variant.findById(variantId);
            if (!variantProduct) {
                return { success: false, error: 'Variant introuvable', code: 'VARIANT_NOT_FOUND' };
            }

            // Supprimer la promotion
            await Promotion.deleteOne({ _id: id });

            return {
                success: true,
                data: { productId: variantProduct.productId },
                message: 'Promotion supprimée avec succès'
            };

        } catch (error) {
            // Gestion des erreurs Mongoose ou autres
            return {
                success: false,
                error: error.message || 'Erreur inconnue',
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }

}

module.exports = new PromotionService();