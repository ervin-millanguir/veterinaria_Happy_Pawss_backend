import { pool } from "./database.mjs";

try {
  const resultado = await pool.query("SELECT * FROM productos");
  console.log("Conexión exitosa");
  console.log(resultado.rows);
} catch (error) {
  console.error(error.message);
} finally {
  await pool.end();
}