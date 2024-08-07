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

    // Validation des données reçues
    if (!deliveryNoteId || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Données invalides. Veuillez vérifier le bon de livraison et les produits.' });
    }

    try {
        // Insérer plusieurs produits en une seule transaction
        await dbConnection.transaction(async (transaction) => {
            // Itération sur les produits et insertion dans la table To_list
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
        // Gestion des erreurs
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

// Fonction de suppression du détail du bon de livraison
exports.deleteToList = async (req, res) => {
  const { deliveryNoteId } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM to_list WHERE deliveryNoteId = ?';

  try {
    const result = await dbConnection.query(deleteSql, {
      replacements: [deliveryNoteId],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'Le détail du bon de livraison a été supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du détail du bon de livraison :', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du détail du bon de livraison.' });
  }
};

// Mise à jour d'une succursale
exports.updateToList = async (req, res) => {
  const { returnQuantity, productId, deliveryNoteId } = req.body;

  // Requête de mise à jour avec paramètres nommés pour SQL Server
  const updateSql = `
    UPDATE to_list 
    SET returnQuantity = :returnQuantity 
    WHERE productId = :productId 
      AND deliveryNoteId = :deliveryNoteId
  `;

  try {
    // Exécution de la requête avec Sequelize et paramètres nommés
    await dbConnection.query(updateSql, {
      replacements: {
        returnQuantity,
        productId,
        deliveryNoteId
      },
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: `Produit ${productId} a été bien mis à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du détail du bon de livraison :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du détail du bon de livraison.' });
  }
};
