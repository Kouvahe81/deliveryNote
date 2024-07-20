const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour l'insertion
router.post('/product', productCtrl.createProduct,responseMiddleware);

// Route de la liste des produits
router.get('/products/:category?', productCtrl.listProducts,responseMiddleware);

// Route pour la suppression des produits
router.delete('/product/:productId', productCtrl.DeleteProduct,responseMiddleware)

// Route pour la modification des produits
router.put('/product/:productId', productCtrl.UpdateProduct,responseMiddleware)

module.exports = router;