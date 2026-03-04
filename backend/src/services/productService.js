const {Product} = require("../models");
const {ProductRead} = require("../models");

class ProductService{

    async createProduct(productData) {
        try {
            const product = new Product(productData);
            await product.save();
            return { success: true, data: product };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }

    async updateProduct(productData) {
        try {
            console.log("productData in update product :"+JSON.stringify(productData) );
            const { _id, ...updateData } = productData;
            const product = await Product.findByIdAndUpdate(
                _id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!product) {
                return { success: false, error: 'Produit non trouvé', code: 'NOT_FOUND' };
            }

            return { success: true, data: product };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }

    async findAll() {
        try {
            const products = await ProductRead.find().lean();
            return { success: true, data: products };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }
    async findAllReal() {
        try {
            const products = await Product.find().lean();
            return  products ;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }

    async findAllForUserReal(userId) {
        try {
            // Récupérer tous les produits
            const result = await this.findAll();

            if (!result.success) {
                return result;
            }

            const products = result.data;

            // Filtrer les produits pour ne garder que ceux où l'utilisateur a des variants
            const filteredProducts = products.map(product => {
                // Filtrer les variants pour ne garder que ceux de l'utilisateur
                const userVariants = product.variants.filter(variant =>
                    variant.userId && variant.userId.toString() === userId.toString()
                );

                // Retourner le produit avec seulement les variants de l'utilisateur
                return {
                    ...product,
                    variants: userVariants
                };
            }).filter(product => product.variants.length > 0); // Ne garder que les produits avec au moins un variant

            return { success: true, data: filteredProducts };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: 'FILTER_ERROR'
            };
        }
    }

    static async deleteProduct(id) {
        try {
            await Product.deleteOne({ _id: id });
            return { success: true, data: { message: 'Product deleted successfully' } };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }
}

module.exports = new ProductService();