const { Sequelize } = require('sequelize');
require('dotenv').config(); 

const dbConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST, 
  database: process.env.DB_NAME, 
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: false
    },
  },
};
const dbConnection = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  dialectOptions: dbConfig.dialectOptions,
  logging: false, // Désactive les messages de journalisation SQL
});

const connectToDatabase = async () => {
  try {
    await dbConnection.authenticate();
    console.log('Connected to the database.');
  } catch (error) {
    console.error('Connection error to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  dbConfig,
  dbConnection,
  connectToDatabase,
};
