const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in your environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Max number of connections in pool
  idleTimeoutMillis: 10000, // How long to keep idle connections open
  connectionTimeoutMillis: 2000, // Timeout before considering a connection failure
});

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  // eslint-disable-next-line global-require
  dialectModule: require('pg'), // Use pg as the dialect module
  pool,
  logging: false, // Disable SQL logging
});

module.exports = sequelize;
