const {dbConnection } = require('../dbConfig');
const { Sequelize ,QueryTypes} = require('sequelize');

// Fonction pour la liste  du détail d'un bons de livraisons
exports.listTo_list = async(req, res) => {
    try {
        const results = await dbConnection.query(`SELECT * FROM to_list `);
        res.status(200).json(results[0]);
      } catch (error) {
        console.error("Erreur lors de la récupération du détail d'un bons de livraisons :", error);
        res.status(500).json({ error: "Erreur lors de la récupération du détail d'un bons de livraisons" });
    }
};

// Requête POST pour ajouter des produits
exports.createToList = async (req, res) => {
  const { deliveryNoteId, products } = req.body;
  if (!deliveryNoteId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Données invalides. Veuillez vérifier le bon de livraison et les produits.' });
  }
  try {
      await dbConnection.transaction(async (transaction) => {
          for (const product of products) {
              const insertQuery = `
                  INSERT INTO To_list (productId, deliveryNoteId, deliveryQuantity, returnQuantity, productPrice)
                  VALUES (?, ?, ?, ?, ?)
              `;
              const insertValues = [product.productId, deliveryNoteId, product.deliveryQuantity, product.returnQuantity, product.productPrice];
              
              await dbConnection.query(insertQuery, {
                  replacements: insertValues,
                  type: dbConnection.QueryTypes.INSERT,
                  transaction
              });
          }
      });

      res.status(201).json({ message: 'Les produits ont été ajoutés avec succès.' });
  } catch (error) {
      console.error('Erreur lors de l\'ajout des produits:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajout des produits.' });
  }
};


// Fonction pour mettre à jour la quantité d'un produit
exports.updateQuantity = async (req, res) => {
  const { productId, deliveryNoteId, returnQuantity } = req.body;
  
  if (!productId || !deliveryNoteId) {
      return res.status(400).json({ error: 'ID du produit ou ID du bon de livraison manquant' });
  }

  try {
      await dbConnection.query(
          `UPDATE to_list
           SET returnQuantity = :returnQuantity
           WHERE productId = :productId AND deliveryNoteId = :deliveryNoteId`,
          {
              replacements: { returnQuantity, productId, deliveryNoteId },
              type: QueryTypes.UPDATE
          }
      );
      res.status(200).json({ message: 'Quantité mise à jour avec succès' });
  } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

exports.deleteToList = async (req, res) => {
  const { deliveryNoteId, productId } = req.params;  // Récupérer deliveryNoteId et productId

  // Requête SQL pour supprimer une ligne spécifique basée sur deliveryNoteId et productId
  const deleteSql = 'DELETE FROM to_list WHERE deliveryNoteId = ? AND productId = ?';

  try {
    const result = await dbConnection.query(deleteSql, {
      replacements: [deliveryNoteId, productId],  // Passer à la fois deliveryNoteId et productId
      type: Sequelize.QueryTypes.DELETE
    });
    
    res.status(200).json({ message: 'Le produit a été supprimé avec succès du bon de livraison.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit du bon de livraison :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit du bon de livraison.' });
  }
};

exports.updateToList = async (req, res) => {
  const { productId, deliveryQuantity, returnQuantity, productPrice, deliveryNoteId } = req.body;
  
  if (!productId) {
    console.error('Erreur : productId manquant');
    return res.status(400).json({ error: 'productId manquant' });
  }

  try {
    const updateSql = `
      UPDATE to_list
      SET  returnQuantity = ?
      WHERE productId = ? AND deliveryNoteId = ?`;
    const updateValues = [ returnQuantity, productId, deliveryNoteId];

    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: QueryTypes.UPDATE
    });
    
    res.status(200).json({ message: `Produit ${productId} mis à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la ligne produit :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la ligne produit' });
  }
};

// Fonction pour supprimer un produit 
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const deleteSql = `
  DELETE FROM to_list
  WHERE productId = :productId
`;

  try {
    // Exécuter la requête SQL avec les paramètres
    const result = await dbConnection.query(deleteSql, {
      replacements: { productId },
      type: Sequelize.QueryTypes.DELETE
    });

    // Vérifiez le nombre de lignes supprimées
    if (result[1] === 0) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    res.status(200).json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
  }
};