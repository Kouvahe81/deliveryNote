const express = require('express');
const router = express.Router()
const deliveryNoteCtrl = require('../controllers/deliveryNote');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les  bons de livraisons
router.get('/deliveryNote',deliveryNoteCtrl.listDeliveryNotes,responseMiddleware);

router.get('/getLastDeliveryNoteId',deliveryNoteCtrl.getLastDeliveryNoteId,responseMiddleware);

router.get('/deliveryNotes', deliveryNoteCtrl.getDeliveryNoteWithProducts, responseMiddleware);

// Route de la nouvelle catégorie
router.post('/deliveryNote', deliveryNoteCtrl.createDeliveryNote,responseMiddleware);

// Route de la suppression
router.delete('/deliveryNote/:deliveryNoteId', deliveryNoteCtrl.DeletedeliveryNote,responseMiddleware);

//Route de la mise à jour
router.put('/deliveryNote/:deliveryNoteId', deliveryNoteCtrl.UpdatedeliveryNote,responseMiddleware);

module.exports = router;