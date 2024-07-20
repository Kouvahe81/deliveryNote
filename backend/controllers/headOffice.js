const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

// Fonction pour la liste des maisons mères
exports.listHeadOffices = async (req, res) => {
  try {
    const results = await dbConnection.query(`SELECT * FROM headOffice ORDER BY headOfficeName`);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des maisons mère :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des maisons mère' });
  }
};


// Requête de création d'une maison mère
exports.createHeadOffice = async (req, res) => {
  const { headOfficeName, headOfficeAddress, headOfficeCity, headOfficePostalCode, headOfficeVATNumber, headOfficeRateReduction } = req.body;

  // Vérifier si la maison mère existe déjà
  const checkHeadOfficeSql = 'SELECT * FROM headOffice WHERE headOfficeName = ? OR headOfficeAddress = ?';
  try {
    const checkHeadOfficeResults = await dbConnection.query(checkHeadOfficeSql, {
      replacements: [headOfficeName, headOfficeAddress],
      type: Sequelize.QueryTypes.SELECT
    });

    if (checkHeadOfficeResults.length > 0) {
      // La maison mère existe déjà
      res.status(409).json({ message: 'La maison mère existe déjà.' });
    } else {
      // La maison mère n'existe pas, procéder à l'insertion
      const insertHeadOfficeSql = 'INSERT INTO headOffice (headOfficeName, headOfficeAddress, headOfficeCity, headOfficePostalCode, headOfficeVATNumber, headOfficeRateReduction) VALUES(?,?,?,?,?,?)';
      const insertHeadOfficeValues = [headOfficeName, headOfficeAddress, headOfficeCity, headOfficePostalCode, headOfficeVATNumber, headOfficeRateReduction];

      await dbConnection.query(insertHeadOfficeSql, {
        replacements: insertHeadOfficeValues,
        type: Sequelize.QueryTypes.INSERT
      });
      
      res.status(201).json({ message: 'La maison mère est créée avec succès.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la maison mère :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la maison mère.' });
  }
};

// Suppression d'une maison mère
exports.DeleteHeadOffice = async (req, res) => {
  const { headOfficeID } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM headOffice WHERE headOfficeId = ?';

  try {
    await dbConnection.query(deleteSql, {
      replacements: [headOfficeID],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'La maison mère a été supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la maison mère :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la maison mère.' });
  }
};

// Mise à jour d'une maison mère
exports.UpdateHeadOffice = async (req, res) => {
  const { headOfficeName, headOfficeAddress, headOfficeCity, headOfficePostalCode, headOfficeVATNumber, headOfficeRateReduction } = req.body;
  const { headOfficeID } = req.params;

  // Requête de mise à jour
  const updateSql = 'UPDATE headOffice SET headOfficeName = ?, headOfficeAddress = ?, headOfficeCity = ?, headOfficePostalCode = ?, headOfficeVATNumber = ?, headOfficeRateReduction = ? WHERE headOfficeId = ?';
  const updateValues = [headOfficeName, headOfficeAddress, headOfficeCity, headOfficePostalCode, headOfficeVATNumber, headOfficeRateReduction, headOfficeID];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: `${headOfficeName} a été bien mise à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la maison mère :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la maison mère.' });
  }
};
