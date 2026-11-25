const service = require('../services/usuarios.service');
const ROLES = ['administrador', 'recepcionista', 'dueno_mascota'];
const validoId = (v) => /^\d+$/.test(String(v)) && Number(v) > 0 && Number.isSafeInteger(Number(v));
const correoValido = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const textoValido = (v) => typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 120;
function fallo(res, error) {
  if (error.code === '23505') return res.status(409).json({ mensaje: 'El correo ya está registrado' });
  if (error.status === 400 || error.code === '23503') return res.status(400).json({ mensaje: 'Rol inválido' });
  console.error('Error en CRUD usuarios:', error.message);
  return res.status(500).json({ mensaje: 'Error interno al gestionar usuarios' });
}
async function listar(req, res) {
  try { res.json(await service.listar()); } catch (e) { fallo(res, e); }
}
async function obtenerPorId(req, res) {
  if (!validoId(req.params.id)) return res.status(400).json({ mensaje: 'ID inválido' });
  const id = Number(req.params.id);
  if (req.usuario.rol !== 'administrador' && req.usuario.id !== id) return res.status(403).json({ mensaje: 'Solo puedes ver tu cuenta' });
  try {
    const usuario = await service.buscarPorId(id);
    return usuario ? res.json(usuario) : res.status(404).json({ mensaje: 'Usuario no encontrado' });
  } catch (e) { return fallo(res, e); }
}
async function crear(req, res) {
  const { nombre, apellido, correo, contrasena, rol = 'dueno_mascota' } = req.body || {};
  if (!textoValido(nombre) || !textoValido(apellido) || !correoValido(correo) ||
      typeof contrasena !== 'string' || contrasena.length < 8 || !ROLES.includes(rol)) {
    return res.status(400).json({ mensaje: 'Completa nombre, apellido, correo, contraseña (mínimo 8) y rol válido' });
  }
  try {
    const usuario = await service.crear({ nombre:nombre.trim(), apellido:apellido.trim(),
      correo:correo.trim().toLowerCase(), contrasena, rol });
    return res.status(201).json(usuario);
  } catch (e) { return fallo(res, e); }
}
async function actualizar(req, res) {
  if (!validoId(req.params.id)) return res.status(400).json({ mensaje: 'ID inválido' });
  const id = Number(req.params.id), esAdmin = req.usuario.rol === 'administrador';
  if (!esAdmin && req.usuario.id !== id) return res.status(403).json({ mensaje: 'Solo puedes editar tu cuenta' });
  const { nombre, apellido, correo, rol, activo } = req.body || {};
  if (!esAdmin && (rol !== undefined || activo !== undefined)) return res.status(403).json({ mensaje: 'Solo el administrador cambia rol o estado' });
  if ([nombre,apellido,correo,rol,activo].every(v => v === undefined)) return res.status(400).json({ mensaje: 'No hay cambios para guardar' });
  if ((nombre !== undefined && !textoValido(nombre)) || (apellido !== undefined && !textoValido(apellido)) ||
      (correo !== undefined && !correoValido(correo)) || (rol !== undefined && !ROLES.includes(rol)) ||
      (activo !== undefined && typeof activo !== 'boolean')) return res.status(400).json({ mensaje: 'Datos de usuario inválidos' });
  try {
    const usuario = await service.actualizar(id, { nombre:nombre?.trim(), apellido:apellido?.trim(),
      correo:correo?.trim().toLowerCase(), rol, activo });
    return usuario ? res.json(usuario) : res.status(404).json({ mensaje: 'Usuario no encontrado' });
  } catch (e) { return fallo(res, e); }
}
async function desactivar(req, res) {
  if (!validoId(req.params.id)) return res.status(400).json({ mensaje: 'ID inválido' });
  if (Number(req.params.id) === req.usuario.id) return res.status(409).json({ mensaje: 'No puedes desactivar tu propia cuenta administrativa' });
  try {
    const ok = await service.desactivar(Number(req.params.id));
    return ok ? res.status(204).end() : res.status(404).json({ mensaje: 'Usuario no encontrado' });
  } catch (e) { return fallo(res, e); }
}
module.exports = { listar, obtenerPorId, crear, actualizar, desactivar };
