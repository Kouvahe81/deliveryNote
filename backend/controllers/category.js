const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

// Récupérer toutes les catégories
exports.AllCategory = async (req, res) => {
  try {
    const results = await dbConnection.query(`SELECT c.*, vr.vatRateTaxe
    FROM Category c
    INNER JOIN VatRate vr ON c.vatRateId = vr.vatRateId ORDER BY categoryName`);
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

// Créer une catégorie
exports.createCategory = async (req, res) => {
  const { categoryName, vatRateId } = req.body;

  // Vérifier si la catégorie existe déjà
  const checkCategorySql = 'SELECT * FROM category WHERE categoryName = ?';
  try {
    const checkCategoryResults = await dbConnection.query(checkCategorySql, {
      replacements: [categoryName],
      type: Sequelize.QueryTypes.SELECT
    });

    if (checkCategoryResults.length > 0) {
      // La catégorie existe déjà
      res.status(409).json({ message: 'La catégorie existe déjà.' });
    } else {
      // La catégorie n'existe pas, procéder à l'insertion
      const insertCategorySql = 'INSERT INTO category (categoryName, vatRateId) VALUES (?, ?)';
      const insertCategoryValues = [categoryName, vatRateId];

      await dbConnection.query(insertCategorySql, {
        replacements: insertCategoryValues,
        type: Sequelize.QueryTypes.INSERT
      });
      
      res.status(201).json({ message: 'La catégorie est créée avec succès.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la catégorie.' });
  }
};

// Mettre à jour une catégorie
exports.UpdateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { categoryName, vatRateId } = req.body;

  // Requête de mise à jour
  const updateSql = 'UPDATE category SET categoryName = ?, vatRateId = ? WHERE categoryId = ?';
  const updateValues = [categoryName, vatRateId, categoryId];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: 'La catégorie a été bien mise à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie.' });
  }
};

// Supprimer une catégorie
exports.DeleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM category WHERE categoryId = ?';

  try {
    await dbConnection.query(deleteSql, {
      replacements: [categoryId],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'Catégorie supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie.' });
  }
};
