const express = require('express');
const router = express.Router()
const toListCtrl = require('../controllers/toList');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les toListes
router.get('/toList',toListCtrl.listTo_list,responseMiddleware);

// Route de la nouvelle catégorie
router.post('/toList', toListCtrl.createToList,responseMiddleware);

// Route de la suppression
router.delete('/to_list/:deliveryNoteId', toListCtrl.deleteToList, responseMiddleware)

//Route de la mise à jour
router.put('/toList', toListCtrl.updateToList, responseMiddleware);



module.exports = router;