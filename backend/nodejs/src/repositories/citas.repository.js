const pool = require("../config/database");

const camposCita = `
  c.id,
  c.usuario_id AS "usuarioId",
  c.servicio_id AS "servicioId",
  s.nombre AS servicio,
  c.nombre_mascota AS "nombreMascota",
  c.especie,
  c.fecha::text AS fecha,
  c.hora::text AS hora,
  c.motivo,
  c.estado,
  c.fecha_solicitud AS "fechaSolicitud"
`;

const crear = async (usuarioId, datos) => {
  const resultado = await pool.query(
    `INSERT INTO citas (
      usuario_id,
      servicio_id,
      nombre_mascota,
      especie,
      fecha,
      hora,
      motivo
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [
      usuarioId,
      datos.servicioId,
      datos.nombreMascota,
      datos.especie,
      datos.fecha,
      datos.hora,
      datos.motivo
    ]
  );

  return buscarPorId(resultado.rows[0].id);
};

const listar = async () => {
  const resultado = await pool.query(`
    SELECT ${camposCita}
    FROM citas c
    JOIN servicios s ON s.id = c.servicio_id
    ORDER BY c.fecha DESC, c.hora DESC
  `);

  return resultado.rows;
};

const listarPorUsuario = async (usuarioId) => {
  const resultado = await pool.query(
    `SELECT ${camposCita}
     FROM citas c
     JOIN servicios s ON s.id = c.servicio_id
     WHERE c.usuario_id = $1
     ORDER BY c.fecha DESC, c.hora DESC`,
    [usuarioId]
  );

  return resultado.rows;
};

const buscarPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT ${camposCita}
     FROM citas c
     JOIN servicios s ON s.id = c.servicio_id
     WHERE c.id = $1`,
    [id]
  );

  return resultado.rows[0] || null;
};

const actualizarEstado = async (id, estado) => {
  const resultado = await pool.query(
    `UPDATE citas
     SET estado = $1
     WHERE id = $2
     RETURNING id`,
    [estado, id]
  );

  if (resultado.rowCount === 0) {
    return null;
  }

  return buscarPorId(id);
};

module.exports = {
  crear,
  listar,
  listarPorUsuario,
  buscarPorId,
  actualizarEstado
};