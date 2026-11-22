let servicios = [];
let siguienteId = 1;

const listar = () => {
  return servicios;
};

const buscarPorId = (id) => {
  return servicios.find((s) => s.id === Number(id));
};

const crear = (datos) => {
  const servicio = {
    id: siguienteId++,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    precio: datos.precio,
  };

  servicios.push(servicio);
  return servicio;
};

const actualizar = (id, datos) => {
  const servicio = buscarPorId(id);

  if (!servicio) return null;

  Object.assign(servicio, datos, { id: servicio.id });

  return servicio;
};

const eliminar = (id) => {
  const indice = servicios.findIndex(
    (s) => s.id === Number(id)
  );

  if (indice === -1) return false;

  servicios.splice(indice, 1);
  return true;
};

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
};