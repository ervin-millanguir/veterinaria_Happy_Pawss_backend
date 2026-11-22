const obtenerSaludo = (req, res) => {
  res.status(200).json({
    mensaje: "Bienvenido a la API de Happy Paws",
    estado: "OK"
  });
};

module.exports = {
  obtenerSaludo
};