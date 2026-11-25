const bcrypt = require("bcrypt");
const usuariosRepository = require("../repositories/usuarios.repository");

const listar = async () => usuariosRepository.listar();

const buscarPorId = async (id) => usuariosRepository.buscarPorId(id);

const crear = async (usuario) => {
  const contrasenaHash = await bcrypt.hash(usuario.contrasena, 12);

  return usuariosRepository.crear({
    ...usuario,
    contrasena_hash: contrasenaHash
  });
};

const actualizar = async (id, datos) => {
  return usuariosRepository.actualizar(id, datos);
};

const desactivar = async (id) => usuariosRepository.desactivar(id);

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  desactivar
};
