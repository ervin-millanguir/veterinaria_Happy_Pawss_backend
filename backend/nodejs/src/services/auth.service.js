const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuariosRepository = require("../repositories/usuarios.repository");

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const opcionesJwt = () => {
  const opciones = {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    issuer: process.env.JWT_ISSUER || "happy-paws-api",
    audience: process.env.JWT_AUDIENCE || "happy-paws-client"
  };

  return opciones;
};

const registrar = async (datos, rol = "CLIENTE") => {
  const correo = datos.correo.trim().toLowerCase();
  const correoExistente = await usuariosRepository.buscarPorCorreo(correo);

  if (correoExistente) {
    throw crearError("El correo ya está registrado", 409);
  }

  if (datos.rut) {
    const rutExistente = await usuariosRepository.buscarPorRut(datos.rut);

    if (rutExistente) {
      throw crearError("El RUT ya está registrado", 409);
    }
  }

  const contrasenaHash = await bcrypt.hash(datos.contrasena, 12);

  try {
    return await usuariosRepository.crearUsuario({
      nombre: datos.nombre,
      apellido: datos.apellido,
      rut: datos.rut,
      correo,
      telefono: datos.telefono,
      contrasena_hash: contrasenaHash,
      rol
    });
  } catch (error) {
    if (error.code === "23505") {
      throw crearError("El correo o RUT ya está registrado", 409);
    }

    throw error;
  }
};

const iniciarSesion = async (correo, contrasena) => {
  const usuario = await usuariosRepository.buscarPorCorreo(correo);

  if (
    !usuario ||
    !usuario.activo ||
    !(await bcrypt.compare(contrasena, usuario.contrasena_hash))
  ) {
    throw crearError("Credenciales incorrectas", 401);
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET debe contener al menos 32 caracteres");
  }

  const token = jwt.sign(
    {
      sub: String(usuario.id),
      id: Number(usuario.id),
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    opcionesJwt()
  );

  return {
    token,
    tipo: "Bearer",
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rut: usuario.rut,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      activo: usuario.activo
    }
  };
};

module.exports = {
  registrar,
  iniciarSesion
};
