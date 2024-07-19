const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

// Récupérer tous les taux de TVA
exports.AllVATRate = async (req, res) => {
  try {
    const results = await dbConnection.query('SELECT * FROM vatrate ORDER BY vatRateId ASC');
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des taux TVA :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des taux TVA' });
  }
};

// Créer un taux de TVA
exports.CreateVATRate = async (req, res) => {
  const { vatRateTaxe, vatRateStartDate, vatRateEndDate } = req.body;

  // Vérifier si le taux existe déjà
  const checkVatRateSql = 'SELECT * FROM vatrate WHERE vatRateTaxe = ?';
  try {
    const checkVatRateResults = await dbConnection.query(checkVatRateSql, {
      replacements: [vatRateTaxe],
      type: Sequelize.QueryTypes.SELECT
    });

    if (checkVatRateResults.length > 0) {
      // Le taux TVA existe déjà
      res.status(409).json({ message: 'Le taux TVA existe déjà.' });
    } else {
      // Le taux TVA n'existe pas, procéder à l'insertion
      const insertVATRateSql = 'INSERT INTO vatrate (vatRateTaxe, vatRateStartDate, vatRateEndDate) VALUES (?, ?, ?)';
      const insertVATRateValues = [vatRateTaxe, vatRateStartDate, vatRateEndDate];

      await dbConnection.query(insertVATRateSql, {
        replacements: insertVATRateValues,
        type: Sequelize.QueryTypes.INSERT
      });
      
      res.status(201).json({ message: 'Le taux TVA est créé avec succès.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un taux TVA :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout d\'un taux TVA.' });
  }
};

// Mettre à jour un taux de TVA
exports.UpdateVATRate = async (req, res) => {
  const { vatRateId } = req.params;
  const { vatRateTaxe, vatRateStartDate, vatRateEndDate } = req.body;

  // Requête de mise à jour
  const updateSql = 'UPDATE vatrate SET vatRateTaxe = ?, vatRateStartDate = ?, vatRateEndDate = ? WHERE vatRateId = ?';
  const updateValues = [vatRateTaxe, vatRateStartDate, vatRateEndDate, vatRateId];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: 'Le taux TVA a été bien mis à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du taux TVA :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du taux TVA.' });
  }
};

// Supprimer un taux de TVA
exports.DeleteVATRate = async (req, res) => {
  const { vatRateId } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM vatrate WHERE vatRateId = ?';

  try {
    await dbConnection.query(deleteSql, {
      replacements: [vatRateId],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'Taux TVA supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un taux TVA :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression d\'un taux TVA.' });
  }
};
