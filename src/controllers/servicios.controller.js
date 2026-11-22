const serviciosService = require("../services/servicios.service");

const listar = (req, res) => {
  res.status(200).json(serviciosService.listar());
};

const buscarPorId = (req, res) => {
  const servicio = serviciosService.buscarPorId(req.params.id);

  if (!servicio) {
    return res.status(404).json({
      mensaje: "Servicio no encontrado",
    });
  }

  res.status(200).json(servicio);
};

const crear = (req, res) => {
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

  const servicio = serviciosService.crear({
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    precio,
  });

  res.status(201).json(servicio);
};

const actualizar = (req, res) => {
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

  const servicio = serviciosService.actualizar(req.params.id, {
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

  res.status(200).json(servicio);
};

const eliminar = (req, res) => {
  const eliminado = serviciosService.eliminar(req.params.id);

  if (!eliminado) {
    return res.status(404).json({
      mensaje: "Servicio no encontrado",
    });
  }

  res.status(200).json({
    mensaje: "Servicio eliminado correctamente",
  });
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};