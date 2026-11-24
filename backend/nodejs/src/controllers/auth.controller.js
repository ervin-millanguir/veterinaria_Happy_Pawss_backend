const authService = require("../services/auth.service");
const usuariosRepository = require("../repositories/usuarios.repository");

const registrar = async (req, res) => {
  try {
    const usuario = await authService.registrar(req.body);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

const iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const resultado = await authService.iniciarSesion(
      correo,
      contrasena
    );

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      ...resultado
    });
  } catch (error) {
    return manejarError(error, res);
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await usuariosRepository.buscarPorId(
      req.usuario.id
    );

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        mensaje: "Usuario no autorizado"
      });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return manejarError(error, res);
  }
};

const manejarError = (error, res) => {
  if ([400, 401, 403, 404, 409].includes(error.status)) {
    return res.status(error.status).json({
      mensaje: error.message
    });
  }

  return res.status(500).json({
    mensaje: "Error interno del servidor"
  });
};

module.exports = {
  registrar,
  iniciarSesion,
  obtenerPerfil
};