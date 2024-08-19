const express = require('express');
const router = express.Router()
const invoiceCtrl = require('../controllers/invoice');
const responseMiddleware = require('../middleware/responseMiddleware');

router.get('/invoice',invoiceCtrl.getSalesReport,responseMiddleware);

router.get('/salesQuantities',invoiceCtrl.getSolQuantities,responseMiddleware);

router.post('/invoice',invoiceCtrl.createInvoice,responseMiddleware);

module.exports = router;