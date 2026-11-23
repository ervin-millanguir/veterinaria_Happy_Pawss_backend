const pool = require("../config/database");

const convertirProducto = (producto) => {
  if (!producto) return null;

  return {
    ...producto,
    precio: Number(producto.precio),
  };
};

const listar = async () => {
  const resultado = await pool.query(
    "SELECT id, nombre, precio, stock FROM productos ORDER BY id"
  );

  return resultado.rows.map(convertirProducto);
};

const buscarPorId = async (id) => {
  const resultado = await pool.query(
    "SELECT id, nombre, precio, stock FROM productos WHERE id = $1",
    [id]
  );

  return convertirProducto(resultado.rows[0]);
};

const crear = async (datos) => {
  const resultado = await pool.query(
    `INSERT INTO productos (nombre, precio, stock)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, precio, stock`,
    [datos.nombre, datos.precio, datos.stock]
  );

  return convertirProducto(resultado.rows[0]);
};

const actualizar = async (id, datos) => {
  const resultado = await pool.query(
    `UPDATE productos
     SET nombre = COALESCE($1, nombre),
         precio = COALESCE($2, precio),
         stock = COALESCE($3, stock)
     WHERE id = $4
     RETURNING id, nombre, precio, stock`,
    [
      datos.nombre ?? null,
      datos.precio ?? null,
      datos.stock ?? null,
      id,
    ]
  );

  return convertirProducto(resultado.rows[0]);
};

const eliminar = async (id) => {
  const resultado = await pool.query(
    "DELETE FROM productos WHERE id = $1 RETURNING id",
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
