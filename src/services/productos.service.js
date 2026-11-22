let productos = [];
let siguienteId = 1;

const listar = () => {
  return productos;
};

const buscarPorId = (id) => {
  return productos.find((p) => p.id === Number(id));
};

const crear = (datos) => {
  const producto = {
    id: siguienteId++,
    nombre: datos.nombre,
    precio: datos.precio,
    stock: datos.stock,
  };

  productos.push(producto);
  return producto;
};

const actualizar = (id, datos) => {
  const producto = buscarPorId(id);

  if (!producto) return null;

  Object.assign(producto, datos, { id: producto.id });

  return producto;
};

const eliminar = (id) => {
  const indice = productos.findIndex(
    (p) => p.id === Number(id)
  );

  if (indice === -1) return false;

  productos.splice(indice, 1);
  return true;
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};