const express = require("express")
const router = express.Router()
const personCtrl = require('../controllers/person')
const responseMiddleware = require('../middleware/responseMiddleware');


// Route pour la liste des personnes
router.get('/person', personCtrl.listPersons,responseMiddleware);

// Route recherche de la fonction
router.get('/person/:email', personCtrl.searchFunction,responseMiddleware)

// Route pour l'insertion
router.post('/person', personCtrl.createPerson,responseMiddleware);

// Route pour la suppression des produits
router.delete('/person/:personID', personCtrl.deletePerson,responseMiddleware)

// Route pour la modification des produits
router.put('/person/:personID', personCtrl.updatePerson,responseMiddleware)


module.exports = router;