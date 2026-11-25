const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registrar({ nombre, apellido, correo, contrasena }) {
  const rol = await pool.query("SELECT id FROM roles WHERE nombre = 'dueno_mascota'");
  if (!rol.rowCount) throw new Error('Falta el rol dueno_mascota: aplica database/usuarios_roles.sql');
  const hash = await bcrypt.hash(contrasena, 10);
  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, apellido, correo`,
    [nombre, apellido, correo.toLowerCase(), hash, rol.rows[0].id]
  );
  return { ...resultado.rows[0], rol: 'dueno_mascota', activo: true };
}

async function iniciarSesion(correo, contrasena) {
  const resultado = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.correo, u.contrasena, u.activo, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.correo = $1`,
    [correo.toLowerCase()]
  );
  if (!resultado.rowCount || !resultado.rows[0].activo) return null;
  const usuario = resultado.rows[0];
  if (!(await bcrypt.compare(contrasena, usuario.contrasena))) return null;
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configura JWT_SECRET de al menos 32 caracteres');
  }
  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '2h' });
  return { token, tipo: 'Bearer', expiraEnSegundos: 7200, usuario: {
    id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido,
    correo: usuario.correo, rol: usuario.rol, activo: true
  } };
}

module.exports = { registrar, iniciarSesion };
