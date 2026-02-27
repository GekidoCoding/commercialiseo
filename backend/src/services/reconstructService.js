const { Product, Variant, Promotion, Category, ProductRead } = require('../models');

class ReconstructService {
    /**
     * Reconstruit complètement le read model product_read depuis les modèles write
     * Chaque productRead inclut ses variants, et chaque variant inclut ses promotions
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    async reconstructProductReadModel() {
        try {
            // Une seule vague de requêtes parallèles pour toutes les collections
            const [products, allVariants, allPromotions, allCategories] = await Promise.all([
                Product.find().lean(),
                Variant.find().lean(),
                Promotion.find().lean(),
                Category.find().lean()
            ]);

            // Maps pour accès O(1)
            const categoriesMap = new Map(allCategories.map(cat => [cat._id.toString(), cat]));

            // Grouper les promotions par variantId en une seule passe
            const promotionsMap = new Map();
            for (const promo of allPromotions) {
                const variantId = promo.variantId?.toString();
                if (!variantId) continue;
                if (!promotionsMap.has(variantId)) promotionsMap.set(variantId, []);
                promotionsMap.get(variantId).push(this.toPromotionRead(promo));
            }

            // Grouper les variants par productId en une seule passe
            const variantsMap = new Map();
            for (const variant of allVariants) {
                const productId = variant.productId?.toString();
                if (!productId) continue;
                if (!variantsMap.has(productId)) variantsMap.set(productId, []);
                const variantId = variant._id.toString();
                variantsMap.get(productId).push(
                    this.toVariantRead(variant, promotionsMap.get(variantId) || [])
                );
            }

            // Préparer les opérations bulk
            const productReadOperations = products.map(product => {
                const productId = product._id.toString();
                const category = categoriesMap.get(product.categoryId?.toString()) || null;
                return {
                    insertOne: {
                        document: {
                            product:  this.toProductData(product),
                            category: category ? this.toCategoryData(category) : {},
                            variants: variantsMap.get(productId) || []
                        }
                    }
                };
            });

            // Suppression + insertion en parallèle (deleteMany ne bloque pas l'écriture)
            await Promise.all([
                ProductRead.deleteMany({}),
                // On attend la suppression avant d'insérer : on la chaîne
            ]);

            if (productReadOperations.length > 0) {
                await ProductRead.bulkWrite(productReadOperations, { ordered: false });
            }

            return {
                success: true,
                data: {
                    totalProducts:     products.length,
                    totalVariants:     allVariants.length,
                    totalPromotions:   allPromotions.length,
                    totalProductReads: productReadOperations.length
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Reconstruit le read model pour un produit spécifique
     * @param {string} productId - ID du produit à reconstruire
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    async reconstructSingleProduct(productId) {
        try {
            // ========== PHASE 1 : CONSTRUCTION DU NOUVEAU MODÈLE ==========

            // 1re vague : product + variants en parallèle
            const [product, variants] = await Promise.all([
                Product.findById(productId).lean(),
                Variant.find({ productId }).lean()
            ]);

            if (!product) {
                return { success: false, error: 'Produit non trouvé' };
            }

            // 2e vague : category + toutes les promotions en une seule requête $in
            const variantIds = variants.map(v => v._id);
            const [category, allPromotions] = await Promise.all([
                product.categoryId ? Category.findById(product.categoryId).lean() : Promise.resolve(null),
                variantIds.length > 0
                    ? Promotion.find({ variantId: { $in: variantIds } }).lean()
                    : Promise.resolve([])
            ]);

            // Grouper les promotions par variantId en mémoire
            const promotionsMap = new Map();
            for (const promo of allPromotions) {
                const key = promo.variantId.toString();
                if (!promotionsMap.has(key)) promotionsMap.set(key, []);
                promotionsMap.get(key).push(this.toPromotionRead(promo));
            }

            // Construire les variantReads
            const variantReads = variants.map(variant =>
                this.toVariantRead(variant, promotionsMap.get(variant._id.toString()) || [])
            );

            // ========== PHASE 2 : PRÉPARATION DU DOCUMENT COMPLET ==========

            const newProductRead = {
                product: this.toProductData(product),
                category: category ? this.toCategoryData(category) : {},
                variants: variantReads,
                _id: productId,
                lastReconstructedAt: new Date()
            };

            // ========== PHASE 3 : REMPLACEMENT ATOMIQUE ==========

            const productRead = await ProductRead.findOneAndReplace(
                { 'product._id': productId },
                newProductRead,
                {
                    upsert: true,
                    returnDocument: 'after',  //  Remplacé 'new: true' par 'returnDocument: "after"'
                    runValidators: true
                }
            );

            return {
                success: true,
                data: productRead,
                meta: {
                    variantsCount: variantReads.length,
                    promotionsCount: allPromotions.length,
                    reconstructedAt: newProductRead.lastReconstructedAt
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                phase: error.phase || 'unknown'
            };
        }
    }
    // ─── Helpers privés ────────────────────────────────────────────────────────

    /** @private */
    toPromotionRead(promotion) {
        return {
            _id:           promotion._id,
            value:         promotion.value,
            typePromotion: promotion.typePromotion,
            dateBegin:     promotion.dateBegin,
            dateEnd:       promotion.dateEnd,
            createdAt:     promotion.createdAt
        };
    }

    /** @private */
    toVariantRead(variant, promotions = []) {
        return {
            _id:                variant._id,
            code:               variant.code,
            stock:              variant.stock,
            userId:             variant.userId,
            price:              variant.price,
            specificAttributes: variant.specificAttributes || {},
            lastUpdated:        variant.lastUpdated,
            images:             variant.images || [],
            isMain:             variant.isMain,
            promotions
        };
    }

    /** @private */
    toProductData(product) {
        return {
            _id:         product._id,
            name:        product.name,
            categoryId:  product.categoryId,
            code:        product.code,
            specs:       product.specs || {},
            releaseDate: product.releaseDate,
            createdAt:   product.createdAt
        };
    }

    /** @private */
    toCategoryData(category) {
        return {
            _id:   category._id,
            name:  category.name,
            unity: category.unity
        };
    }
}

module.exports = new ReconstructService();