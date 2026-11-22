const express = require("express");
const cors = require("cors");

const saludoRoutes = require("./routes/saludo.routes");
const productosRoutes = require("./routes/productos.routes");
const serviciosRoutes = require("./routes/servicios.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/saludo", saludoRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/servicios", serviciosRoutes);

module.exports = app;