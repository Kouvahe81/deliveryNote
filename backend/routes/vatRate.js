const express = require('express');
const router = express.Router()
const vatRateCtrl = require('../controllers/vatRate');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les branches
router.get('/vatRate',vatRateCtrl.AllVATRate,responseMiddleware);

// Route de la nouvelle catégorie
router.post('/vatRate', vatRateCtrl.CreateVATRate,responseMiddleware);

// Route de la suppression
router.delete('/vatRate/:vatRateId', vatRateCtrl.DeleteVATRate,responseMiddleware);

//Route de la mise à jour
router.put('/vatRate/:vatRateId', vatRateCtrl.UpdateVATRate,responseMiddleware);

module.exports = router;