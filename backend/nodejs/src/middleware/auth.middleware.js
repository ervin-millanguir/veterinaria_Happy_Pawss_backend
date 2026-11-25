const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const match = /^Bearer\s+(\S+)$/i.exec(cabecera);
  if (!match) return res.status(401).json({ mensaje: 'Se requiere un JWT válido' });
  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (_) {
    return res.status(401).json({ mensaje: 'Token inválido o vencido' });
  }
  if (!Number.isInteger(payload.id) || payload.id < 1) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
  try {
    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.correo, u.activo, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = $1`,
      [payload.id]
    );
    if (!resultado.rowCount || !resultado.rows[0].activo) {
      return res.status(401).json({ mensaje: 'Cuenta inactiva o no encontrada' });
    }
    // Los permisos actuales se obtienen de PostgreSQL: no confiamos en un rol antiguo del JWT.
    req.usuario = resultado.rows[0];
    next();
  } catch (error) {
    console.error('Error al validar la sesión:', error.message);
    res.status(503).json({ mensaje: 'No es posible validar la sesión en este momento' });
  }
}

function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, permitirRoles };
