const { Pool } = require('pg');
const fs = require('fs');
const sslActivo = process.env.DB_SSL === 'true';
const ssl = sslActivo ? { rejectUnauthorized: true,
  ...(process.env.DB_CA_PATH ? { ca: fs.readFileSync(process.env.DB_CA_PATH, 'utf8') } : {})
} : false;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
});
module.exports = pool;
