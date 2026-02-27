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
}

module.exports = new ProductService();
