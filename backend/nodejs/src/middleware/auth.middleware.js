const jwt = require("jsonwebtoken");
const usuariosRepository = require("../repositories/usuarios.repository");
const { normalizarRol } = require("../utils/roles");

const jwtOptions = () => ({
  algorithms: ["HS256"],
  issuer: process.env.JWT_ISSUER || "happy-paws-api",
  audience: process.env.JWT_AUDIENCE || "happy-paws-client"
});

const verificarToken = async (req, res, next) => {
  const autorizacion = req.headers.authorization || "";
  const match = /^Bearer\s+(\S+)$/i.exec(autorizacion);

  if (!match) {
    return res.status(401).json({
      mensaje: "Se requiere un JWT válido"
    });
  }

  let payload;

  try {
    payload = jwt.verify(
      match[1],
      process.env.JWT_SECRET,
      jwtOptions()
    );
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o vencido"
    });
  }

  const usuarioId = payload.sub !== undefined
    ? Number(payload.sub)
    : payload.id;

  if (!Number.isSafeInteger(usuarioId) || usuarioId < 1) {
    return res.status(401).json({
      mensaje: "Token inválido"
    });
  }

  if (
    !Number.isSafeInteger(payload.exp) ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return res.status(401).json({
      mensaje: "Token inválido o vencido"
    });
  }

  try {
    const usuario = await usuariosRepository.buscarPorId(usuarioId);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        mensaje: "Cuenta inactiva o no encontrada"
      });
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    console.error("Error al validar la sesión:", error.message);
    return res.status(503).json({
      mensaje: "No es posible validar la sesión en este momento"
    });
  }
};

const permitirRoles = (...rolesPermitidos) => {
  const rolesCanonicos = rolesPermitidos
    .map(normalizarRol)
    .filter(Boolean);

  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Autenticación requerida"
      });
    }

    if (!rolesCanonicos.includes(normalizarRol(req.usuario.rol))) {
      return res.status(403).json({
        mensaje: "No tienes permisos para realizar esta acción"
      });
    }

    return next();
  };
};

module.exports = {
  verificarToken,
  permitirRoles,
  autenticar: verificarToken,
  autorizarRoles: permitirRoles
};
