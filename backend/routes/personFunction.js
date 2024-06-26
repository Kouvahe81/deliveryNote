// backend/routes/personFunction.js

const express = require('express');
const router = express.Router();
const functionCtrl = require('../controllers/personFunction');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour la liste des fonctions des personnes
router.get('/personFunction', functionCtrl.listFunctions, responseMiddleware);
// Route pour l'insertion
router.post('/personFunction', functionCtrl.createFunction,responseMiddleware);

// Route pour la suppression des fonctions
router.delete('/personFunction/:functionId', functionCtrl.deleteFunction,responseMiddleware)

// Route pour la modification des fonctions
router.put('/personFunction/:functionId', functionCtrl.updateFunction,responseMiddleware)

module.exports = router;


