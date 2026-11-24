const citasService = require("../services/citas.service");

const manejarError = (res, error) => {
  return res.status(error.status || 500).json({
    mensaje: error.status
      ? error.message
      : "Error interno del servidor"
  });
};

const crear = async (req, res) => {
  try {
    const cita = await citasService.crear(
      req.usuario.id,
      req.body
    );

    return res.status(201).json(cita);
  } catch (error) {
    return manejarError(res, error);
  }
};

const listar = async (req, res) => {
  try {
    const citas = await citasService.listar();
    return res.status(200).json(citas);
  } catch (error) {
    return manejarError(res, error);
  }
};

const listarMisCitas = async (req, res) => {
  try {
    const citas = await citasService.listarPorUsuario(
      req.usuario.id
    );

    return res.status(200).json(citas);
  } catch (error) {
    return manejarError(res, error);
  }
};

const buscarPorId = async (req, res) => {
  try {
    const cita = await citasService.buscarPorId(
      req.params.id,
      req.usuario
    );

    return res.status(200).json(cita);
  } catch (error) {
    return manejarError(res, error);
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const cita = await citasService.actualizarEstado(
      req.params.id,
      req.body.estado
    );

    return res.status(200).json(cita);
  } catch (error) {
    return manejarError(res, error);
  }
};

module.exports = {
  crear,
  listar,
  listarMisCitas,
  buscarPorId,
  actualizarEstado
};