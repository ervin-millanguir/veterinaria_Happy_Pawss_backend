const pool = require('../config/database');
const bcrypt = require('bcrypt');
const columnas = `u.id, u.nombre, u.apellido, u.correo, u.activo, u.creado_en, r.nombre AS rol`;

async function listar() {
  const result = await pool.query(`SELECT ${columnas} FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.id`);
  return result.rows;
}
async function buscarPorId(id) {
  const result = await pool.query(`SELECT ${columnas} FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id=$1`, [id]);
  return result.rows[0] || null;
}
async function crear({ nombre, apellido, correo, contrasena, rol }) {
  const hash = await bcrypt.hash(contrasena, 10);
  const result = await pool.query(
    `INSERT INTO usuarios(nombre,apellido,correo,contrasena,rol_id)
     SELECT $1,$2,$3,$4,id FROM roles WHERE nombre=$5 RETURNING id`,
    [nombre, apellido, correo, hash, rol]
  );
  if (!result.rowCount) { const err = new Error('Rol inexistente');err.status = 400;throw err; }
  return buscarPorId(result.rows[0].id);
}
async function actualizar(id, datos) {
  const { nombre, apellido, correo, rol, activo } = datos;
  let rolId = null;
  if (rol !== undefined) {
    const encontrada = await pool.query('SELECT id FROM roles WHERE nombre=$1', [rol]);
    if (!encontrada.rowCount) { const err = new Error('Rol inexistente');err.status = 400;throw err; }
    rolId = encontrada.rows[0].id;
  }
  const resultado = await pool.query(
    `UPDATE usuarios
     SET nombre=COALESCE($1,nombre), apellido=COALESCE($2,apellido),
         correo=COALESCE($3,correo), rol_id=COALESCE($4,rol_id), activo=COALESCE($5,activo)
     WHERE id=$6 RETURNING id`,
    [nombre ?? null, apellido ?? null, correo ?? null, rolId, activo ?? null, id]
  );
  return resultado.rowCount ? buscarPorId(id) : null;
}
async function desactivar(id) {
  const result = await pool.query('UPDATE usuarios SET activo=false WHERE id=$1 RETURNING id', [id]);
  return result.rowCount > 0;
}
module.exports = { listar, buscarPorId, crear, actualizar, desactivar };
