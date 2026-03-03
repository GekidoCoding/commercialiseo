/**
 * Routes publics
 */
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const adminController = require("../controllers/adminController");


router.get('/categories', ...publicController.findAllCategories);
router.post('/category/create', ...publicController.createCategory);
router.delete('/category/delete/:id', ...publicController.deleteCategory);
router.get('/products', ...publicController.findAllProductsReal);

module.exports = router;
