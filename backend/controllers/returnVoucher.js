const { dbConnection } = require('../dbConfig');
const { QueryTypes } = require('sequelize');

// Fonction pour vérifier l'existence d'un bon retour
exports.getReturnVoucher= async (req, res) => {
  const deliveryNoteId = req.query.deliveryNoteId || req.params.deliveryNoteId;

  if (!deliveryNoteId) {
    return res.status(400).json({ error: 'ID du bon de livraison manquant' });
  }

  try {
      const query = `
          SELECT *
          FROM ReturnVoucher
          WHERE
            deliveryNoteId = :deliveryNoteId
            AND returnVoucherStatus = 1
      `;

      // Exécutez la requête en passant le paramètre
      const results = await dbConnection.query(query, {
          replacements: { deliveryNoteId }, 
          type: QueryTypes.SELECT // Indique que la requête est de type SELECT
      });

      res.status(200).json(results);
  } catch (error) {
      console.error('Erreur lors de la récupération des bons retour :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des bons retour' });
  }
};

// Fonction pour créer un nouveau bon retour
exports.createReturnVoucher = async (req, res) => {
    const { returnVoucherCode, returnVoucherDate,returnVoucherStatus } = req.body;
    const { deliveryNoteId } = req.params;
    console.log('code', returnVoucherCode)
    console.log('date', returnVoucherDate)
    console.log('statut', returnVoucherStatus)
    console.log('id', deliveryNoteId)
    
    if (!deliveryNoteId) {
        return res.status(400).json({ error: 'ID du bon de livraison manquant' });
    }

    try {
        await dbConnection.query(
            `INSERT INTO ReturnVoucher (returnVoucherCode, returnVoucherDate,returnVoucherStatus, deliveryNoteId) 
             VALUES (:returnVoucherCode, :returnVoucherDate, :returnVoucherStatus, :deliveryNoteId)`,
            {
                replacements: { returnVoucherCode, returnVoucherDate, returnVoucherStatus, deliveryNoteId },
                type: QueryTypes.INSERT
            }
        );

        res.status(201).json({ message: 'Bon retour créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du bon retour:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};


// Fonction pour mettre à jour le statut du bon retour
exports.UpdateReturnVoucher = async (req, res) => {
    const { deliveryNoteId } = req.params; 
    const { returnVoucherStatus } = req.body;

    if (returnVoucherStatus === undefined) {
        return res.status(400).json({ error: 'Statut du bon retour manquant' });
    }

    try {
        // Mettre à jour le statut du bon retour
        const updateSql = `
            UPDATE ReturnVoucher
            SET returnVoucherStatus = :returnVoucherStatus
            WHERE deliveryNoteId = :deliveryNoteId
        `;
        //console.log('status',returnVoucherStatus)
        const [affectedRows] = await dbConnection.query(updateSql, {
            replacements: {
                returnVoucherStatus,
                deliveryNoteId
            },
            type: QueryTypes.UPDATE
        });

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Bon de retour non trouvé' });
        }

        res.status(200).json({ message: 'Statut du bon retour mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du bon retour:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};
