const pool = require("../config/database");

const buscarPorCorreo = async (correo) => {
  const resultado = await pool.query(
    `SELECT u.*, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id
     WHERE LOWER(u.correo) = LOWER($1)`,
    [correo]
  );

  return resultado.rows[0];
};

const buscarPorRut = async (rut) => {
  const resultado = await pool.query(
    "SELECT id FROM usuarios WHERE rut = $1",
    [rut]
  );

  return resultado.rows[0];
};

const buscarPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.rut,
            u.correo, u.telefono, u.activo,
            r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.rol_id = r.id
     WHERE u.id = $1`,
    [id]
  );

  return resultado.rows[0];
};

const crearUsuario = async (usuario) => {
  const resultado = await pool.query(
    `INSERT INTO usuarios (
        nombre, apellido, rut, correo,
        telefono, contrasena_hash, rol_id
     )
     VALUES (
        $1, $2, $3, $4, $5, $6,
        (SELECT id FROM roles WHERE nombre = 'CLIENTE')
     )
     RETURNING id, nombre, apellido, rut, correo,
               telefono, activo, fecha_registro`,
    [
      usuario.nombre,
      usuario.apellido,
      usuario.rut,
      usuario.correo.trim().toLowerCase(),
      usuario.telefono,
      usuario.contrasena_hash
    ]
  );

  return resultado.rows[0];
};

module.exports = {
  buscarPorCorreo,
  buscarPorRut,
  buscarPorId,
  crearUsuario
};