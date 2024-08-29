const { dbConnection } = require('../dbConfig');
const { Sequelize } = require('sequelize');

exports.createPerson = async (req, res, next) => {
  const { personFirstName, personLastName, personEmail,  functionId } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const checkPersonSql = 'SELECT * FROM person WHERE personEmail = ?';

  try {
    const checkPersonResults = await dbConnection.query(checkPersonSql, 
      {
        replacements: [personEmail],
        type: Sequelize.QueryTypes.SELECT
      });

    if (checkPersonResults.length > 0) {
      // L'utilisateur existe déjà, renvoyer un message indiquant qu'il existe
      res.status(409).json({ message: 'L\'utilisateur existe déjà.' });
    } else {
      // L'utilisateur n'existe pas, procéder à l'insertion
      const insertPersonSql = 'INSERT INTO person (personFirstName, personLastName, personEmail, functionId) VALUES (?, ?, ?, ?)';
      const personValues = [personFirstName, personLastName, personEmail, functionId]
      try {
        await dbConnection.query(insertPersonSql, 
          {
            replacements: personValues,
            type: Sequelize.QueryTypes.INSERT
          });
        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
      } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un utilisateur.', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout d\'un utilisateur.' });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de l\'existence de l\'utilisateur.' });
  }
};


// Fonction pour la liste des utilisateurs
exports.listPersons = async (req, res, next) => {
  try {
    const results = await dbConnection.query('SELECT p.*, f.* FROM Person p INNER JOIN PersonFunction f ON p.[functionId] = f.[functionId] ORDER BY p.personFirstName;');
    req.results = results[0];
    next(); 
  } catch (error) {
    console.error('Erreur lors de la liste des utilisateurs :', error);
    next(error); 
  }
};

// Recherche de mail
exports.searchFunction = async (req, res, next) => {
  const { mail } = req.params;
  

  // Requête de recherche
  const sql = 'SELECT p.*, f.* FROM person p INNER JOIN PersonFunction f ON p.[functionId] = f.[functionId] WHERE personEmail = ?';

  try {
    const results = await dbConnection.query(sql, {
      replacements: [mail],
      type: Sequelize.QueryTypes.SELECT
    });
    req.results = results[0];
    next();
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'utilisateur', error);
    res.status(500).json({ error: 'Erreur lors de la recherche de l\'utilisateur' });
  }
};


// Mise à jour d'un utilisateur
exports.updatePerson = async (req, res) => {
  const { personID } = req.params;
  const { personFirstName, personLastName, personEmail, functionId } = req.body;

  const updateSql = 'UPDATE person SET personFirstName = ?, personLastName = ?, personEmail = ?, functionId = ? WHERE personId = ?';
  const updateValues = [personFirstName, personLastName, personEmail, functionId, personID];

  try {
    await dbConnection.query(updateSql, {
      replacements: updateValues,
      type: Sequelize.QueryTypes.UPDATE,
    });
    res.status(200).json({ message: `${personLastName} ${personFirstName} a été bien mise à jour` });
  } catch (error) {
    console.error('Erreur lors de la mise à jour.', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};


// Suppression d'un utilisateur
exports.deletePerson = async (req, res) => {
  const { personID } = req.params;

  // Requête pour la suppression
  const deleteSql = 'DELETE FROM person WHERE personID = ?';
  const personValues = [personID]
  try {
    await dbConnection.query(deleteSql, {
      replacements: personValues,
      type: Sequelize.QueryTypes.DELETE,
    });
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un utilisateur', error);
    res.status(500).json({ error: 'Erreur lors de la suppression d\'un utilisateur' });
  }
};


// Recherche de la fonction d'un utilistateur
exports.searchFunction = async (req, res) => {
  const { email } = req.params;

  // Requête de recherche de la fonction de l'utilisateur
  const sql = 'SELECT functionId FROM person WHERE personEmail = ?';

  try {
    const results = await dbConnection.query(sql, {
      replacements: [email],
      type: Sequelize.QueryTypes.SELECT,
    });
    res.status(200).json({
      results,
      message: 'Fonction trouvée avec succès.',
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de la fonction de l\'utilisateur', error);
    res.status(500).json({ error: 'Erreur lors de la recherche de la fonction de l\'utilisateur' });
  }
};
