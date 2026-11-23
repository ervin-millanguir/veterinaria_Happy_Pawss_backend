const productosService = require("../services/productos.service");

const manejarError = (res, error) => {
  console.error("Error en productos:", error.message);

  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
};

const idValido = (id) => {
  const numero = Number(id);
  return Number.isSafeInteger(numero) && numero > 0;
};

const listar = async (req, res) => {
  try {
    const productos = await productosService.listar();
    return res.status(200).json(productos);
  } catch (error) {
    return manejarError(res, error);
  }
};

const buscarPorId = async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  try {
    const producto = await productosService.buscarPorId(req.params.id);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    return res.status(200).json(producto);
  } catch (error) {
    return manejarError(res, error);
  }
};

const crear = async (req, res) => {
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

  try {
    const producto = await productosService.crear({
      nombre: nombre.trim(),
      precio,
      stock,
    });

    return res.status(201).json(producto);
  } catch (error) {
    return manejarError(res, error);
  }
};

const actualizar = async (req, res) => {
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

  if (!idValido(req.params.id)) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  try {
    const producto = await productosService.actualizar(req.params.id, {
      ...(nombre !== undefined && { nombre: nombre.trim() }),
      ...(precio !== undefined && { precio }),
      ...(stock !== undefined && { stock }),
    });

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    return res.status(200).json(producto);
  } catch (error) {
    return manejarError(res, error);
  }
};

const eliminar = async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(404).json({
      mensaje: "Producto no encontrado",
    });
  }

  try {
    const eliminado = await productosService.eliminar(req.params.id);

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      mensaje: "Producto eliminado correctamente",
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
