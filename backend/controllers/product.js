const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

// Fonction pour la liste des produits
exports.listProducts = async (req, res) => {
  const category = req.query.category;
  let sql = `
    SELECT p.*, c.*
    FROM product p
    INNER JOIN category c ON p.productCategoryId = c.categoryID
  `;
  let values = [];
  
  // Si une catégorie est spécifiée, filtrer par cette catégorie
  if (category) {
      sql += ' WHERE p.productCategoryId = ?';
      values = [category];
  }
  sql += ' ORDER BY p.productName';
  try {
    const results = await dbConnection.query(sql, {
      replacements: values,
      type: dbConnection.QueryTypes.SELECT
    });
    res.status(200).json(results);
  } catch (error) {
    console.error('Erreur lors de la liste des produits :', error);
    res.status(500).json({ error: 'Erreur lors de la liste des produits.' });
  }
};


// Requête de création d'un produit
exports.createProduct = async (req, res) => {
  const { productId, productName, productPrice, productCost, productCategoryId } = req.body;
  // Vérifier si le produit existe déjà
  const checkProductSql = 'SELECT * FROM product WHERE productId = ?';
  try {
    const checkProductResults = await dbConnection.query(checkProductSql, {
      replacements: [productId],
      type: Sequelize.QueryTypes.SELECT
    });

    if (checkProductResults.length > 0) {
      // Le produit existe déjà
      res.status(409).json({ message: 'Le produit existe déjà.' });
    } else {
      // Le produit n'existe pas, procéder à l'insertion
      const insertProductSql = 'INSERT INTO product (productId, productName, productPrice, productCost, productCategoryId) VALUES (?, ?, ?, ?, ?)';
      const insertProductValues = [productId, productName, productPrice, productCost, productCategoryId];

      await dbConnection.query(insertProductSql, {
        replacements: insertProductValues,
        type: Sequelize.QueryTypes.INSERT
      });
      
      res.status(201).json({ message: 'Produit créé avec succès.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du produit.' });
  }
};

// Suppression d'un produit
exports.DeleteProduct = async (req, res) => {
  const { productId } = req.params;
 
  // Requête pour la suppression
  const deleteSql = 'DELETE FROM product WHERE productId = ?';
  try {
    await dbConnection.query(deleteSql, {
      replacements: [productId],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
  }
};

// Mise à jour d'un produit
exports.UpdateProduct = async (req, res) => {
  const { productId } = req.params;
  const { productName, productCost, productPrice, productCategoryId } = req.body;

  // Requête de mise à jour
  const updateSql = 'UPDATE product SET productName = ?, productCost = ?, productPrice = ?, productCategoryId = ? WHERE productId = ?';
  const updateValues = [productName, productCost, productPrice, productCategoryId, productId];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: `${productName} a été bien mise à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit.' });
  }
};
