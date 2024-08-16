const express = require('express');
const router = express.Router()
const toListCtrl = require('../controllers/toList');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les toListes
router.get('/toList',toListCtrl.listTo_list,responseMiddleware);

// Route de la nouvelle catégorie
router.post('/to_list', toListCtrl.createToList,responseMiddleware);

// Route de la suppression d'une ligne produit
router.delete('/to_list/:deliveryNoteId/:productId', toListCtrl.deleteToList, responseMiddleware);


// Route pour supprimer un produit par ID
router.delete('/to_list/:productId', toListCtrl.deleteProduct);


//Route de la mise à jour
router.put('/to_list', toListCtrl.updateToList, responseMiddleware);




module.exports = router;