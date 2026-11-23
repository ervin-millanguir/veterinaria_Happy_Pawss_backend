const pool = require("../config/database");

const convertirServicio = (servicio) => {
  if (!servicio) return null;

  return {
    ...servicio,
    precio: Number(servicio.precio),
  };
};

const listar = async () => {
  const resultado = await pool.query(
    "SELECT id, nombre, descripcion, precio FROM servicios ORDER BY id"
  );

  return resultado.rows.map(convertirServicio);
};

const buscarPorId = async (id) => {
  const resultado = await pool.query(
    "SELECT id, nombre, descripcion, precio FROM servicios WHERE id = $1",
    [id]
  );

  return convertirServicio(resultado.rows[0]);
};

const crear = async (datos) => {
  const resultado = await pool.query(
    `INSERT INTO servicios (nombre, descripcion, precio)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, descripcion, precio`,
    [datos.nombre, datos.descripcion, datos.precio]
  );

  return convertirServicio(resultado.rows[0]);
};

const actualizar = async (id, datos) => {
  const resultado = await pool.query(
    `UPDATE servicios
     SET nombre = COALESCE($1, nombre),
         descripcion = COALESCE($2, descripcion),
         precio = COALESCE($3, precio)
     WHERE id = $4
     RETURNING id, nombre, descripcion, precio`,
    [
      datos.nombre ?? null,
      datos.descripcion ?? null,
      datos.precio ?? null,
      id,
    ]
  );

  return convertirServicio(resultado.rows[0]);
};

const eliminar = async (id) => {
  const resultado = await pool.query(
    "DELETE FROM servicios WHERE id = $1 RETURNING id",
    [id]
  );

  return resultado.rowCount > 0;
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};
