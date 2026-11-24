const jwt = require("jsonwebtoken");
const usuariosRepository = require("../repositories/usuarios.repository");

const autenticar = async (req, res, next) => {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !/^Bearer \S+$/i.test(autorizacion)) {
    return res.status(401).json({
      mensaje: "Token de autenticación requerido"
    });
  }

  const token = autorizacion.split(" ")[1];
  let datos;

  try {
    datos = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    });

    if (
      typeof datos.sub !== "string" ||
      !/^[1-9]\d*$/.test(datos.sub) ||
      !Number.isInteger(datos.exp)
    ) {
      throw new Error("Token inválido");
    }
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado"
    });
  }

  try {
    const usuario = await usuariosRepository.buscarPorId(datos.sub);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        mensaje: "Usuario no autorizado"
      });
    }

    req.usuario = usuario;
    next();

  } catch (error) {
    return res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Autenticación requerida"
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: "No tienes permisos para realizar esta acción"
      });
    }

    next();
  };
};

module.exports = {
  autenticar,
  autorizarRoles
};
