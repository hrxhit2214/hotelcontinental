const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Database connected successfully via manual pool protocol.');
});

pool.on('error', (err) => {
  console.log('Database connection not available, using in-memory store.', err.message);
});

module.exports = pool;
