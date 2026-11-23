const serviciosService = require("../services/servicios.service");

const manejarError = (res, error) => {
  console.error("Error en servicios:", error.message);

  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

const idValido = (id) => {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 && numero <= 2147483647;
};

const listar = async (req, res) => {
  try {
    const servicios = await serviciosService.listar();
    return res.status(200).json(servicios);
  } catch (error) {
    return manejarError(res, error);
  }
};

const buscarPorId = async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(404).json({
      mensaje: "Servicio no encontrado",
    });
  }

  try {
    const servicio = await serviciosService.buscarPorId(req.params.id);

    if (!servicio) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    return res.status(200).json(servicio);
  } catch (error) {
    return manejarError(res, error);
  }
};

const crear = async (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    typeof descripcion !== "string" ||
    !descripcion.trim() ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0
  ) {
    return res.status(400).json({
      mensaje: "Nombre, descripción o precio inválidos",
    });
  }

  try {
    const servicio = await serviciosService.crear({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio,
    });

    return res.status(201).json(servicio);
  } catch (error) {
    return manejarError(res, error);
  }
};

const actualizar = async (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  if (
    (nombre !== undefined &&
      (typeof nombre !== "string" || !nombre.trim())) ||
    (descripcion !== undefined &&
      (typeof descripcion !== "string" || !descripcion.trim())) ||
    (precio !== undefined &&
      (typeof precio !== "number" ||
        !Number.isFinite(precio) ||
        precio < 0))
  ) {
    return res.status(400).json({
      mensaje: "Datos de servicio inválidos",
    });
  }

  if (!idValido(req.params.id)) {
    return res.status(404).json({
      mensaje: "Servicio no encontrado",
    });
  }

  try {
    const servicio = await serviciosService.actualizar(req.params.id, {
      ...(nombre !== undefined && { nombre: nombre.trim() }),
      ...(descripcion !== undefined && {
        descripcion: descripcion.trim(),
      }),
      ...(precio !== undefined && { precio }),
    });

    if (!servicio) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    return res.status(200).json(servicio);
  } catch (error) {
    return manejarError(res, error);
  }
};

const eliminar = async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(404).json({
      mensaje: "Servicio no encontrado",
    });
  }

  try {
    const eliminado = await serviciosService.eliminar(req.params.id);

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    return res.status(200).json({
      mensaje: "Servicio eliminado correctamente",
    });
  } catch (error) {
    return manejarError(res, error);
  }
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};
