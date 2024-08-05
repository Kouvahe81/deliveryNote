const {dbConnection } = require('../dbConfig');
const { Sequelize,QueryTypes } = require('sequelize');


// Fonction pour la liste des bons de livraisons
exports.listDeliveryNotes = async (req, res) => {
  try {
      const results = await dbConnection.query(`
          SELECT 
              DeliveryNote.*, 
              branch.branchCode,
              branch.branchName, 
              branch.branchAddress, 
              branch.branchCity, 
              branch.branchPostalCode 
          FROM DeliveryNote 
          JOIN branch ON DeliveryNote.branchId = branch.branchId
          WHERE DeliveryNote.DeliveryNoteStatus = 0
      `);
      res.status(200).json(results[0]);
  } catch (error) {
      console.error('Erreur lors de la récupération des bons de livraisons :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des bons de livraisons' });
  }
};

// Fonction pour récupérer les bon de livraison et lignes produits associés
exports.getDeliveryNoteWithProducts = async (req, res) => {
  const deliveryNoteId = req.query.id || req.params.id; // Prend en compte les deux formats : query ou params

  if (!deliveryNoteId) {
    return res.status(400).json({ error: 'ID du bon de livraison manquant' });
  }

  try {
      const query = `
          SELECT *
          FROM DeliveryNote AS d
          INNER JOIN To_list AS l ON d.deliveryNoteId = l.deliveryNoteId
          INNER JOIN Branch AS b ON d.branchId = b.branchId
          INNER JOIN Product AS p ON l.productId = p.productId
          WHERE
              d.deliveryNoteId = :deliveryNoteId
      `;

      // Exécutez la requête en passant le paramètre
      const results = await dbConnection.query(query, {
          replacements: { deliveryNoteId }, 
          type: QueryTypes.SELECT // Indique que la requête est de type SELECT
      });

      res.status(200).json(results);
  } catch (error) {
      console.error('Erreur lors de la récupération des détails du bon de livraison :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des détails du bon de livraison' });
  }
};

// Fonction pour récupérer le dernier bon de livraison
exports.getLastDeliveryNoteId = async (req, res) => {
  try {
      const results = await dbConnection.query(`SELECT MAX(deliveryNoteId) AS lastId FROM DeliveryNote`);
      res.status(200).json(results[0]);
      }
  catch (error) {
      console.error('Erreur lors de la récupération du dernier ID de bon de livraison :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du dernier ID de bon de livraison' });
  }
};

exports.createDeliveryNote = async (req, res) => {
  const { deliveryNoteNumber, deliveryDate, deliveryNoteStatus, branchId } = req.body;

  try {
    // Commencez une transaction
    await dbConnection.transaction(async (t) => {
      // Insérez le bon de livraison
      const insertDeliveryNoteSql = `
        INSERT INTO deliveryNote (deliveryNoteNumber, deliveryDate, deliveryNoteStatus, branchId)
        VALUES (?, ?, ?, ?);
        SELECT SCOPE_IDENTITY() as deliveryNoteId;`; // Ajoutez SELECT SCOPE_IDENTITY() après l'insertion
      const insertDeliveryNoteValues = [deliveryNoteNumber, deliveryDate, deliveryNoteStatus, branchId];
      const [results] = await dbConnection.query(insertDeliveryNoteSql, {
        replacements: insertDeliveryNoteValues,
        type: Sequelize.QueryTypes.INSERT,
        transaction: t
      });

      // Récupérez l'ID du bon de livraison nouvellement créé
      const deliveryNoteId = results[0].deliveryNoteId;

      res.status(201).json({ deliveryNoteId, message: 'Bon de livraison créé avec succès.' });
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du bon de livraison :', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du bon de livraison.' });
  }
};


// Suppression d'une succursale
exports.DeletedeliveryNote = async (req, res) => {
  const {deliveryNoteId } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM deliveryNote WHERE deliveryNoteId = ?';

  try {
    await dbConnection.query(deleteSql, {
      replacements: [deliveryNoteId],
      type: Sequelize.QueryTypes.DELETE
    });
    res.status(200).json({ message: 'Le bon de livraison a été supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du bon de livraison  :', error);
    res.status(500).json({ error: 'Erreur lors du bon de livraison.' });
  }
};


// Mise à jour d'une succursale
exports.UpdatedeliveryNote = async (req, res) => {
  const { deliveryNoteNumber, deliveryDate, deliveryNoteStatus } = req.body;
  const { deliveryNoteId } = req.params; 

  // Requête de mise à jour
  const updateSql = 'UPDATE deliveryNote SET deliveryNoteNumber = ?, deliveryDate = ?, deliveryNoteStatus = ? WHERE deliveryNoteId = ?';
  const updateValues = [deliveryNoteNumber, deliveryDate, deliveryNoteStatus, deliveryNoteId];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE
    });
    res.status(200).json({ message: `${deliveryNoteNumber} a été bien mise à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bon de livraison :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du bon de livraison.' });
  }
};

