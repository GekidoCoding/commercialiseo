const {asyncHandler} = require("../utils/asyncHandler");
const CategoryService = require("../services/categoryService");
const productService = require("../services/productService");
const pushNotificationService = require("../services/pushNotificationService");
const {createdResponse, successResponse} = require("../utils/responseHandler");


const publicController={

    findAllCategories: [
        asyncHandler(async (req, res) => {
            const result = await CategoryService.findAll();
            return createdResponse(res, result, 'Liste des categories succes');
        }),
    ],

    createCategory: [
        asyncHandler(async (req, res) => {
            const { name , unity} = req.body;
            const category = {
                name,
                unity
            };
            const result = await CategoryService.createCategory(category);
            return createdResponse(res, result, result.message);
        }),
    ],

    deleteCategory: [
        asyncHandler(async (req, res) => {
            const { id} = req.params;
            const result = await CategoryService.deleteCategory(id);
            return createdResponse(res, result, result.message);
        }),
    ],

    findAllProductsReal: [
        asyncHandler(async (req, res) => {
            const result = await productService.findAllReal();
            return createdResponse(res, result, 'Liste des produits succes');
        }),
    ],

    markNotificationRead: [
        asyncHandler(async (req, res) => {
            const { id } = req.params;
            const result = await pushNotificationService.markRead(id);
            return successResponse(res, result, 'Notification marquée comme lue');
        }),
    ],

    findNotificationsByUserId: [
        asyncHandler(async (req, res) => {
            const { userId } = req.params;
            const result = await pushNotificationService.findNotificationsByUserId(userId);
            return successResponse(res, result, 'Notifications récupérées avec succès');
        }),
    ],
}
module.exports = publicController;