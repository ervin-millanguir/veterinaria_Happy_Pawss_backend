const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true"
    ? {
        ca: fs.readFileSync(
          path.join(__dirname, "../../global-bundle.pem"),
          "utf8"
        ),
        rejectUnauthorized: true,
      }
    : false,
});

module.exports = pool;