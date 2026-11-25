const service = require("../services/usuarios.service");
const { esAdministrador, normalizarRol } = require("../utils/roles");

const ROLES = [
  "ADMIN",
  "CLIENTE",
  "RECEPCIONISTA",
  "administrador",
  "recepcionista",
  "dueno_mascota"
];

const validoId = (valor) => (
  /^\d+$/.test(String(valor)) &&
  Number(valor) > 0 &&
  Number.isSafeInteger(Number(valor))
);

const correoValido = (valor) => (
  typeof valor === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
);

const textoValido = (valor) => (
  typeof valor === "string" &&
  valor.trim().length >= 2 &&
  valor.trim().length <= 120
);

const rutValido = (valor) => (
  typeof valor === "string" &&
  /^\d{7,8}-[\dK]$/i.test(valor.trim())
);

const telefonoValido = (valor) => (
  typeof valor === "string" &&
  /^\+?\d{8,15}$/.test(valor.trim())
);

const fallo = (res, error) => {
  if (error.code === "23505") {
    return res.status(409).json({
      mensaje: "El correo o RUT ya está registrado"
    });
  }

  if (error.status === 400 || error.code === "23503") {
    return res.status(400).json({
      mensaje: "Rol inválido"
    });
  }

  console.error("Error en CRUD usuarios:", error.message);
  return res.status(500).json({
    mensaje: "Error interno al gestionar usuarios"
  });
};

const listar = async (req, res) => {
  try {
    return res.json(await service.listar());
  } catch (error) {
    return fallo(res, error);
  }
};

const obtenerPorId = async (req, res) => {
  if (!validoId(req.params.id)) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  const id = Number(req.params.id);
  const administrador = esAdministrador(req.usuario.rol);

  if (!administrador && Number(req.usuario.id) !== id) {
    return res.status(403).json({
      mensaje: "Solo puedes ver tu cuenta"
    });
  }

  try {
    const usuario = await service.buscarPorId(id);
    return usuario
      ? res.json(usuario)
      : res.status(404).json({ mensaje: "Usuario no encontrado" });
  } catch (error) {
    return fallo(res, error);
  }
};

const crear = async (req, res) => {
  const {
    nombre,
    apellido,
    rut,
    correo,
    telefono,
    contrasena,
    rol = "dueno_mascota"
  } = req.body || {};

  if (
    !textoValido(nombre) ||
    !textoValido(apellido) ||
    !correoValido(correo) ||
    (rut !== undefined && rut !== "" && !rutValido(rut)) ||
    (telefono !== undefined && telefono !== "" && !telefonoValido(telefono)) ||
    typeof contrasena !== "string" ||
    contrasena.length < 8 ||
    Buffer.byteLength(contrasena, "utf8") > 72 ||
    !ROLES.includes(rol)
  ) {
    return res.status(400).json({
      mensaje: "Completa los datos de usuario con valores válidos"
    });
  }

  try {
    const usuario = await service.crear({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      rut: rut ? rut.trim().replace(/\./g, "").toUpperCase() : null,
      correo: correo.trim().toLowerCase(),
      telefono: telefono ? telefono.trim() : null,
      contrasena,
      rol
    });

    return res.status(201).json(usuario);
  } catch (error) {
    return fallo(res, error);
  }
};

const actualizar = async (req, res) => {
  if (!validoId(req.params.id)) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  const id = Number(req.params.id);
  const administrador = esAdministrador(req.usuario.rol);
  const { nombre, apellido, rut, correo, telefono, rol, activo } = req.body || {};

  if (!administrador && Number(req.usuario.id) !== id) {
    return res.status(403).json({
      mensaje: "Solo puedes editar tu cuenta"
    });
  }

  if (!administrador && (rol !== undefined || activo !== undefined)) {
    return res.status(403).json({
      mensaje: "Solo el administrador cambia rol o estado"
    });
  }

  const cambios = [nombre, apellido, rut, correo, telefono, rol, activo];

  if (cambios.every((valor) => valor === undefined)) {
    return res.status(400).json({
      mensaje: "No hay cambios para guardar"
    });
  }

  if (
    (nombre !== undefined && !textoValido(nombre)) ||
    (apellido !== undefined && !textoValido(apellido)) ||
    (rut !== undefined && rut !== "" && !rutValido(rut)) ||
    (correo !== undefined && !correoValido(correo)) ||
    (telefono !== undefined && telefono !== "" && !telefonoValido(telefono)) ||
    (rol !== undefined && (!ROLES.includes(rol) || !normalizarRol(rol))) ||
    (activo !== undefined && typeof activo !== "boolean")
  ) {
    return res.status(400).json({
      mensaje: "Datos de usuario inválidos"
    });
  }

  try {
    const usuario = await service.actualizar(id, {
      nombre: nombre?.trim(),
      apellido: apellido?.trim(),
      rut: rut === "" ? null : rut?.trim().replace(/\./g, "").toUpperCase(),
      correo: correo?.trim().toLowerCase(),
      telefono: telefono === "" ? null : telefono?.trim(),
      rol,
      activo
    });

    return usuario
      ? res.json(usuario)
      : res.status(404).json({ mensaje: "Usuario no encontrado" });
  } catch (error) {
    return fallo(res, error);
  }
};

const desactivar = async (req, res) => {
  if (!validoId(req.params.id)) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  const id = Number(req.params.id);

  if (id === Number(req.usuario.id)) {
    return res.status(409).json({
      mensaje: "No puedes desactivar tu propia cuenta administrativa"
    });
  }

  try {
    const desactivado = await service.desactivar(id);
    return desactivado
      ? res.status(204).end()
      : res.status(404).json({ mensaje: "Usuario no encontrado" });
  } catch (error) {
    return fallo(res, error);
  }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  desactivar
};
