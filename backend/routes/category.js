const express = require('express');
const router = express.Router()
const categoryCtrl = require('../controllers/category');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les catégories
router.get('/category',categoryCtrl.AllCategory,responseMiddleware);

// Route de la nouvelle catégorie
router.post('/category', categoryCtrl.createCategory,responseMiddleware);

// Route de la suppression
router.delete('/category/:categoryId', categoryCtrl.DeleteCategory,responseMiddleware);

//Route de la mise à jour
router.put('/category/:categoryId', categoryCtrl.UpdateCategory,responseMiddleware);

module.exports = router;