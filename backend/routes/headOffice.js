const express = require('express');
const router = express.Router();
const headOfficeCtrl = require('../controllers/headOffice');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour l'insertion
router.post('/headOffice', headOfficeCtrl.createHeadOffice,responseMiddleware);

// Route de la liste des produits
router.get('/headOffice/', headOfficeCtrl.listHeadOffices,responseMiddleware);

// Route pour la suppression des produits
router.delete('/headOffice/:headOfficeID', headOfficeCtrl.DeleteHeadOffice,responseMiddleware)

// Route pour la modification des produits
router.put('/headOffice/:headOfficeID', headOfficeCtrl.UpdateHeadOffice,responseMiddleware)

module.exports = router;