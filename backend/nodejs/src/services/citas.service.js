const citasRepository = require("../repositories/citas.repository");
const { esAdministrador } = require("../utils/roles");

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const crear = async (usuarioId, datos) => {
  try {
    return await citasRepository.crear(usuarioId, datos);
  } catch (error) {
    if (
      error.code === "23505" &&
      error.constraint === "idx_citas_horario_activo"
    ) {
      throw crearError("El horario seleccionado no está disponible", 409);
    }

    if (error.code === "23503") {
      throw crearError("El usuario o servicio no existe", 404);
    }

    throw error;
  }
};

const listar = async () => {
  return citasRepository.listar();
};

const listarPorUsuario = async (usuarioId) => {
  return citasRepository.listarPorUsuario(usuarioId);
};

const buscarPorId = async (id, usuario) => {
  const cita = await citasRepository.buscarPorId(id);

  if (!cita) {
    throw crearError("Cita no encontrada", 404);
  }

  if (
    !esAdministrador(usuario.rol) &&
    Number(cita.usuarioId) !== Number(usuario.id)
  ) {
    throw crearError("No tienes permiso para consultar esta cita", 403);
  }

  return cita;
};

const actualizarEstado = async (id, estado) => {
  const estadosPermitidos = [
    "Pendiente",
    "Confirmada",
    "Cancelada",
    "Atendida"
  ];

  if (!estadosPermitidos.includes(estado)) {
    throw crearError("Estado de cita inválido", 400);
  }

  try {
    const cita = await citasRepository.actualizarEstado(id, estado);

    if (!cita) {
      throw crearError("Cita no encontrada", 404);
    }

    return cita;
  } catch (error) {
    if (
      error.code === "23505" &&
      error.constraint === "idx_citas_horario_activo"
    ) {
      throw crearError("El horario seleccionado no está disponible", 409);
    }

    throw error;
  }
};

module.exports = {
  crear,
  listar,
  listarPorUsuario,
  buscarPorId,
  actualizarEstado
};