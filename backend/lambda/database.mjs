import pg from "pg";
import fs from "node:fs";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 2,
  ssl: process.env.DB_SSL === "true"
    ? {
        ca: fs.readFileSync(
          new URL("./global-bundle.pem", import.meta.url),
          "utf8"
        ),
        rejectUnauthorized: true,
      }
    : false,
});