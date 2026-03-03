const {Variant, Category, Product} = require("../models");
const path = require('path');

class VariantService {
    /**
     * Traite les fichiers uploadés et crée le tableau d'images structuré
     * @param {Array} files - Tableau de fichiers multer
     * @param {Array} existingImages - Images existantes (pour update)
     * @param {boolean} setFirstAsMain - Si true, la première image devient isMain
     * @returns {Array} - Tableau d'images avec structure {url, isMain}
     */
    processImages(files, existingImages = [], setFirstAsMain = true) {
        if (!files || files.length === 0) {
            return existingImages;
        }

        // Créer les nouvelles URLs d'images
        const newImages = files.map((file, index) => ({
            url: `/images/${file.filename}`,
            isMain: false
        }));

        // Combiner avec les images existantes
        let allImages = [...existingImages, ...newImages];

        // S'assurer qu'il y a exactement une image avec isMain = true
        const hasMainImage = allImages.some(img => img.isMain === true);
        
        if (!hasMainImage && allImages.length > 0 && setFirstAsMain) {
            // Définir la première image comme principale
            allImages[0].isMain = true;
        }

        return allImages;
    }

    setMainImage(images, mainIndex = 0) {
        if (!images || images.length === 0) {
            return images;
        }

        // Toutes les images deviennent non principales
        const updatedImages = images.map((img, index) => ({
            ...img,
            isMain: index === mainIndex
        }));

        return updatedImages;
    }

    async createVariant(variantData, files = []) {
        try {
            // Traiter les fichiers uploadés
            const images = this.processImages(files, [], true);

            console.log("2. le variant data 2 sauvegarder:"+ JSON.stringify(variantData.variant));

            let variantDataTri= JSON.parse(variantData.variant) ;

            // Créer le variant avec les images
            const variantDataWithImages = {
                productId: variantDataTri.productId,
                code:variantDataTri.code,
                price:variantDataTri.price,
                stock:variantDataTri.stock,
                userId: variantDataTri.userId,
                specificAttributes: variantDataTri.specificAttributes,
                images:images,
                lastUpdated: Date.now()
            };
            console.log("3.variant : "+JSON.stringify(variantDataWithImages) );
            const variant = new Variant(variantDataWithImages);
            console.log("4.variant : "+variant);

            const variantCreated = await variant.save();
            console.log("variant created : "+ variantCreated);
            return { success: true, data: variantCreated };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }

    async updateVariant(variantData, files = []) {
        try {
            console.log("2. le variant id data 2 update :"+JSON.stringify(variantData) );
            const { _id, mainImageIndex, ...otherData } = variantData;
            console.log("3. le variant id data 2 update :"+ JSON.stringify(_id));
            // Récupérer le variant existant
            const existingVariant = await Variant.findById(_id);
            if (!existingVariant) {
                return {
                    success: false,
                    error: 'Variant non trouvé',
                    code: 'NOT_FOUND'
                };
            }

            // Traiter les nouveaux fichiers uploadés
            let updatedImages = this.processImages(
                files, 
                existingVariant.images || [], 
                false
            );

            // Si un index d'image principale est spécifié, le définir
            if (mainImageIndex !== undefined && updatedImages.length > 0) {
                updatedImages = this.setMainImage(updatedImages, parseInt(mainImageIndex));
            }

            // S'assurer qu'il y a toujours une image principale si des images existent
            const hasMainImage = updatedImages.some(img => img.isMain === true);
            if (!hasMainImage && updatedImages.length > 0) {
                updatedImages[0].isMain = true;
            }

            // Mettre à jour le variant
            const updatedVariant = await Variant.findByIdAndUpdate(
                _id,
                {
                    ...otherData,
                    images: updatedImages,
                    lastUpdated: new Date()
                },
                { new: true }
            );
            console.log("4.updated variant after find and update :"+ JSON.stringify( updatedVariant) );
            return { success: true, data: updatedVariant };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }
    async deleteVariant(id) {
        try {
            const existingVariant = await Variant.findById(id);
            const productId = existingVariant.productId;

            await Variant.deleteOne({ _id: id });
            return { success: true, data: { productId: productId } };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }
}


module.exports = new VariantService();