const aliases = new Map([
  ["admin", "ADMIN"],
  ["administrador", "ADMIN"],
  ["cliente", "CLIENTE"],
  ["dueno_mascota", "CLIENTE"],
  ["recepcionista", "RECEPCIONISTA"]
]);

const normalizarRol = (rol) => {
  if (typeof rol !== "string") {
    return null;
  }

  return aliases.get(rol.trim().toLowerCase()) || null;
};

const esAdministrador = (rol) => normalizarRol(rol) === "ADMIN";

module.exports = {
  normalizarRol,
  esAdministrador
};
