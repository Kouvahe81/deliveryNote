const express = require('express');
const bodyParser = require('body-parser');
const personFunctionRouter = require('./routes/personFunction');
const personRouter = require('./routes/person');
const vatRateRouter = require('./routes/vatRate')
const categoryRouter = require('./routes/category');
const productRouter = require('./routes/product');
const headOfficeRouter = require('./routes/headOffice');
const branchRouter = require('./routes/branch')
const deleveryNoteRouter = require('./routes/deliveryNote');
const toListRouter = require('./routes/toList');
const returnVoucherRoute = require('./routes/returnVoucher')
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
app.use('/', vatRateRouter);
app.use('/', categoryRouter);
app.use('/', productRouter);
app.use('/', headOfficeRouter);
app.use('/', branchRouter);
app.use('/', deleveryNoteRouter);
app.use('/', toListRouter);
app.use('/', returnVoucherRoute);

module.exports = app;
