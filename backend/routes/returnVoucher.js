const express = require('express');
const router = express.Router()
const returnVoucherCtrl = require('../controllers/returnVoucher');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les  bons retour
router.get('/returnVoucher/:deliveryNoteId', returnVoucherCtrl.getReturnVoucher, responseMiddleware);

// Route pour créer un  bon retour
router.post('/returnVoucher/:deliveryNoteId',returnVoucherCtrl.createReturnVoucher,responseMiddleware);

// Route pour mettre le statut bon retour à jour
router.put('/returnVoucher/:deliveryNoteId',returnVoucherCtrl.UpdateReturnVoucher,responseMiddleware);

module.exports = router;