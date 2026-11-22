const productosService = require("../services/productos.service");

const listar = (req, res) => {
  res.status(200).json(productosService.listar());
};

const buscarPorId = (req, res) => {
  const producto = productosService.buscarPorId(req.params.id);

  if (!producto) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  res.status(200).json(producto);
};

const crear = (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return res.status(400).json({
      mensaje: "Nombre, precio o stock inválidos",
    });
  }

  const producto = productosService.crear({
    nombre: nombre.trim(),
    precio,
    stock,
  });

  res.status(201).json(producto);
};

const actualizar = (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (
    (nombre !== undefined &&
      (typeof nombre !== "string" || !nombre.trim())) ||
    (precio !== undefined &&
      (typeof precio !== "number" ||
        !Number.isFinite(precio) ||
        precio < 0)) ||
    (stock !== undefined &&
      (!Number.isInteger(stock) || stock < 0))
  ) {
    return res.status(400).json({
      mensaje: "Datos de producto inválidos",
    });
  }

  const producto = productosService.actualizar(req.params.id, {
    ...(nombre !== undefined && { nombre: nombre.trim() }),
    ...(precio !== undefined && { precio }),
    ...(stock !== undefined && { stock }),
  });

  if (!producto) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  res.status(200).json(producto);
};

const eliminar = (req, res) => {
  const eliminado = productosService.eliminar(req.params.id);

  if (!eliminado) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  res.status(200).json({
    mensaje: "Producto eliminado correctamente",
  });
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};