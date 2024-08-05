const {dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

// Fonction pour la liste des branches
exports.listBranchs = async(req, res) => {
    try {
        const results = await dbConnection.query(`SELECT b.*, h.* FROM Branch b
        INNER JOIN HeadOffice h ON b.headOfficeId = h.headOfficeId`);
        res.status(200).json(results[0]);
      } catch (error) {
        console.error('Erreur lors de la récupération des succursales :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des succursales' });
    }
};

// Requête de création ou mise à jour de la succursale
exports.createBranch = async (req, res) => {
  const { branchName, branchCode, branchAddress, branchCity, branchPostalCode, headOfficeId } = req.body;
  
  const checkBranchSql = 'SELECT * FROM branch WHERE branchName = ? OR branchAddress = ?';
  try {
    const checkBranchResults = await dbConnection.query(checkBranchSql, {
      replacements: [branchName, branchAddress],
      type: Sequelize.QueryTypes.SELECT
    });

    if (checkBranchResults.length > 0) {
      res.status(409).json({ message: 'La succursale existe déjà.' });
    } else {
      const insertBranchSql = 'INSERT INTO branch (branchName, branchAddress, branchCity, branchPostalCode, headOfficeId, branchCode) VALUES (?, ?, ?, ?, ?, ?)';
      const insertBranchValues = [branchName, branchAddress, branchCity, branchPostalCode, headOfficeId, branchCode];
      await dbConnection.query(insertBranchSql, {
        replacements: insertBranchValues,
        type: Sequelize.QueryTypes.INSERT
      });
      
      res.status(201).json({ message: 'La succursale est créée avec succès.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la succursale :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la succursale.' });
  }
};


// Suppression d'une succursale
exports.DeleteBranch = async (req, res) => {
  const {branchId } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM branch WHERE branchId = ?';

  try {
    await dbConnection.query(deleteSql, {
      replacements: [branchId],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'La succursale a été supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la succursale :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la succursale.' });
  }
};

// Mise à jour d'une succursale
exports.UpdateBranch = async (req, res) => {
  const { branchName, branchCode, branchAddress, branchCity, branchPostalCode, headOfficeId } = req.body;
  const { branchId } = req.params;

  // Requête de mise à jour
  const updateSql = 'UPDATE branch SET branchName = ?, branchAddress = ?, branchCity = ?, branchPostalCode = ?, headOfficeId = ?, branchCode = ? WHERE branchId = ?';
  const updateValues = [branchName, branchAddress, branchCity, branchPostalCode, headOfficeId, branchCode, branchId];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: `${branchName} a été bien mise à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la succursale :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la succursale.' });
  }
};