const pool = require("../config/database");

const columnasPublicas = `
  u.id,
  u.nombre,
  u.apellido,
  u.rut,
  u.correo,
  u.telefono,
  u.activo,
  u.fecha_registro,
  u.creado_en,
  r.nombre AS rol
`;

const buscarPorCorreo = async (correo) => {
  const resultado = await pool.query(
    `SELECT ${columnasPublicas},
            COALESCE(u.contrasena_hash, u.contrasena) AS contrasena_hash
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE LOWER(u.correo) = LOWER($1)`,
    [correo]
  );

  return resultado.rows[0] || null;
};

const buscarPorRut = async (rut) => {
  const resultado = await pool.query(
    "SELECT id FROM usuarios WHERE rut = $1",
    [rut]
  );

  return resultado.rows[0] || null;
};

const buscarPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT ${columnasPublicas}
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE u.id = $1`,
    [id]
  );

  return resultado.rows[0] || null;
};

const crearConHash = async (usuario) => {
  const resultado = await pool.query(
    `INSERT INTO usuarios (
        nombre, apellido, rut, correo, telefono,
        contrasena_hash, contrasena, rol_id
     )
     SELECT $1, $2, $3, $4, $5, $6, $6, id
     FROM roles
     WHERE LOWER(nombre) = LOWER($7)
     RETURNING id`,
    [
      usuario.nombre,
      usuario.apellido,
      usuario.rut || null,
      usuario.correo.trim().toLowerCase(),
      usuario.telefono || null,
      usuario.contrasena_hash,
      usuario.rol
    ]
  );

  if (!resultado.rowCount) {
    const error = new Error("Rol inexistente");
    error.status = 400;
    throw error;
  }

  return buscarPorId(resultado.rows[0].id);
};

const actualizar = async (id, datos) => {
  const { nombre, apellido, rut, correo, telefono, rol, activo } = datos;
  let rolId = null;

  if (rol !== undefined) {
    const resultadoRol = await pool.query(
      "SELECT id FROM roles WHERE LOWER(nombre) = LOWER($1)",
      [rol]
    );

    if (!resultadoRol.rowCount) {
      const error = new Error("Rol inexistente");
      error.status = 400;
      throw error;
    }

    rolId = resultadoRol.rows[0].id;
  }

  const resultado = await pool.query(
    `UPDATE usuarios
     SET nombre = COALESCE($1, nombre),
         apellido = COALESCE($2, apellido),
         rut = COALESCE($3, rut),
         correo = COALESCE($4, correo),
         telefono = COALESCE($5, telefono),
         rol_id = COALESCE($6, rol_id),
         activo = COALESCE($7, activo)
     WHERE id = $8
     RETURNING id`,
    [
      nombre ?? null,
      apellido ?? null,
      rut ?? null,
      correo ?? null,
      telefono ?? null,
      rolId,
      activo ?? null,
      id
    ]
  );

  return resultado.rowCount
    ? buscarPorId(id)
    : null;
};

const desactivar = async (id) => {
  const resultado = await pool.query(
    "UPDATE usuarios SET activo = false WHERE id = $1 RETURNING id",
    [id]
  );

  return resultado.rowCount > 0;
};

const listar = async () => {
  const resultado = await pool.query(
    `SELECT ${columnasPublicas}
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     ORDER BY u.id`
  );

  return resultado.rows;
};

module.exports = {
  buscarPorCorreo,
  buscarPorRut,
  buscarPorId,
  crearUsuario: crearConHash,
  crear: crearConHash,
  actualizar,
  desactivar,
  listar
};
