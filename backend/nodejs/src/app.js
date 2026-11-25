const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const { swaggerUi, esquema } = require("./config/swagger");
const saludoRoutes = require("./routes/saludo.routes");
const productosRoutes = require("./routes/productos.routes");
const serviciosRoutes = require("./routes/servicios.routes");
const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const citasRoutes = require("./routes/citas.routes");

const app = express();

const origenesPermitidos = (process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origen, callback) {
    if (!origen || origenesPermitidos.includes(origen)) {
      return callback(null, true);
    }

    return callback(new Error("Origen CORS no permitido"));
  }
}));
app.use(express.json({ limit: "32kb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    mensaje: "Demasiados intentos. Inténtalo nuevamente en 15 minutos"
  }
});

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    servicio: "happy-paws"
  });
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/saludo", saludoRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/citas", citasRoutes);

app.get(
  ["/api-docs.json", "/api/docs.json"],
  (_req, res) => res.json(esquema)
);

app.use(
  ["/api-docs", "/api/docs"],
  swaggerUi.serve,
  swaggerUi.setup(esquema)
);

app.use((error, _req, res, _next) => {
  if (error.message === "Origen CORS no permitido") {
    return res.status(403).json({
      mensaje: "Origen no autorizado"
    });
  }

  console.error("Error del servidor:", error.message);
  return res.status(500).json({
    mensaje: "Error interno"
  });
});

module.exports = app;
