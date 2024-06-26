const express = require('express');
const bodyParser = require('body-parser');
const personFunctionRouter = require('./routes/personFunction');
const personRouter = require('./routes/person');
const app = express();

// Ajout des en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Utilisation de bodyParser pour traiter le corps des requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware de journalisation des requêtes reçues
app.use((req, res, next) => {
  console.log('Requête reçue !'); 
  next();
});

app.use((req, res, next) => {
  console.log('Réponse envoyée avec succès !');
  next();
});
  
app.use('/', personFunctionRouter);
app.use('/', personRouter);

module.exports = app;
