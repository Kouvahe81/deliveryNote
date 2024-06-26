const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

//Liste des fonctions des utilistaurs
exports.listFunctions = async (req, res, next) => {
  try {
    const results = await dbConnection.query('SELECT * FROM PersonFunction ORDER BY functionName');
    req.results = results[0];
    next(); 
  } catch (error) {
    console.error('Erreur lors de la récupération des fonctions :', error);
    next(error); 
  }
};

//Création de la fonction d'un utilisateur
exports.createFunction = async (req, res, next) => {
  const { functionName } = req.body;
 
  // Check if function already exists
  const checkFunctionSql = 'SELECT * FROM PersonFunction WHERE functionName = ?';
  
  try {
    const checkFunctionResults = await dbConnection.query(checkFunctionSql, 
      {
        replacements: [functionName],
        type: Sequelize.QueryTypes.SELECT
      });

    if (checkFunctionResults.length > 0) {
      // Function already exists
      res.status(409).json({ message: 'La fonction existe déjà.' });
    } else {
      // Function doesn't exist, proceed with insertion
      const insertFunctionSql = 'INSERT INTO PersonFunction (functionName) VALUES(?)';
     
      try {
        await dbConnection.query(insertFunctionSql,
          {
            replacements: [functionName],
            type: Sequelize.QueryTypes.INSERT,
          });
        res.status(201).json({ message: 'Fonction créée avec succès.' });
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la fonction.', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la fonction.' });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence de la fonction :', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de l\'existence de la fonction.' });
  }
};

// Suppression de la fonction d'un utilisateur
exports.deleteFunction = async (req, res) => {
  const { functionId } = req.params;
  const sql = 'DELETE FROM PersonFunction WHERE functionId = ?';
  try {
    await dbConnection.query(sql, {
      replacements: [functionId],
      type: Sequelize.QueryTypes.DELETE,
    });
    res.status(200).json({ message: `Cette fonction a été bien supprimée`});
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une fonction.', error);
    res.status(500).json({ error: 'Erreur lors de la suppression d\'une fonction.' });
  }
};

exports.updateFunction = async (req, res) => {
  const { functionId } = req.params;
  const { functionName } = req.body;

  const updateSql = 'UPDATE personFunction SET functionName = ? WHERE functionId = ?';
  const updateValues = [functionName, functionId];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE,
    }
    );
    res.status(200).json({ message: `${functionName} a été bien mise à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour.', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};