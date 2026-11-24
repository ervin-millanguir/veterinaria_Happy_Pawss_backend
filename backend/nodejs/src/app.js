const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const saludoRoutes = require("./routes/saludo.routes");
const productosRoutes = require("./routes/productos.routes");
const serviciosRoutes = require("./routes/servicios.routes");
const authRoutes = require("./routes/auth.routes");
const citasRoutes = require("./routes/citas.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: "Demasiados intentos. Inténtalo nuevamente en 15 minutos"
  }
});

app.use("/api/auth/login", loginLimiter);

app.use("/api/saludo", saludoRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/citas", citasRoutes);

// Documentación Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});

module.exports = app;