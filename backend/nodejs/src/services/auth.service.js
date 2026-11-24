const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuariosRepository = require("../repositories/usuarios.repository");

const registrar = async (datos) => {
  const correo = datos.correo.trim().toLowerCase();

  const correoExistente = await usuariosRepository.buscarPorCorreo(correo);

  if (correoExistente) {
    throw Object.assign(
      new Error("El correo ya está registrado"),
      { status: 409 }
    );
  }

  const rutExistente = await usuariosRepository.buscarPorRut(datos.rut);

  if (rutExistente) {
    throw Object.assign(
      new Error("El RUT ya está registrado"),
      { status: 409 }
    );
  }

  const contrasena_hash = await bcrypt.hash(datos.contrasena, 12);

  try {
    return await usuariosRepository.crearUsuario({
      nombre: datos.nombre,
      apellido: datos.apellido,
      rut: datos.rut,
      correo,
      telefono: datos.telefono,
      contrasena_hash
    });
  } catch (error) {
    if (error.code === "23505") {
      throw Object.assign(
        new Error("El correo o RUT ya está registrado"),
        { status: 409 }
      );
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
    throw Object.assign(
      new Error("Credenciales incorrectas"),
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      sub: String(usuario.id),
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE
    }
  );

  return {
    token,
    tipo: "Bearer",
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol
    }
  };
};

module.exports = {
  registrar,
  iniciarSesion
};