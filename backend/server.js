const http = require('http');
const { connectToDatabase } = require('./dbConfig');
const cors = require('cors');
const PORT = process.env.PORT || 1433;
const app = require('./app')

// Utilisation du middleware CORS pour toutes les routes
app.use(cors());

// Définition du port
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Configuration du serveur et de la base de données
const port = normalizePort(PORT);
app.set('port', port);

// Gestion des erreurs serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);
// Écoute des connexions sur le port spécifié
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Connexion à la base de données Azure SQL
connectToDatabase();

server.listen(port);
