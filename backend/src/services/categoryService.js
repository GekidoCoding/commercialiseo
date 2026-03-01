const {Category, Product} = require("../models");

class CategoryService{
    static async findAll() {
        try {
            return  await Category.find().lean() ;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }
    static async createCategory(categoryData) {
        try {
            const category = new Category(categoryData);
            await category.save();
            return { success: true, data: category };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }
    static async deleteCategory(id) {
        try {
            await Category.deleteOne({ _id: id });
            return { success: true, data: { message: 'Category deleted successfully' } };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code === 11000 ? 'DUPLICATE_KEY' : 'VALIDATION_ERROR'
            };
        }
    }
}
module.exports = CategoryService;