const express = require('express');
const router = express.Router()
const branchCtrl = require('../controllers/branch');
const responseMiddleware = require('../middleware/responseMiddleware');

// Route pour lister les branches
router.get('/branch',branchCtrl.listBranchs,responseMiddleware);

// Route recherche headOfficeID
router.get('/branch/:branchId', branchCtrl.getHeadOfficeIdByBranchId,responseMiddleware);

// Route de la nouvelle catégorie
router.post('/branch', branchCtrl.createBranch,responseMiddleware);

// Route de la suppression
router.delete('/branch/:branchId', branchCtrl.DeleteBranch,responseMiddleware);

//Route de la mise à jour
router.put('/branch/:branchId', branchCtrl.UpdateBranch,responseMiddleware);

module.exports = router;