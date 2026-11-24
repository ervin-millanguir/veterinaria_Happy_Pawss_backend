const { body, param, validationResult } = require("express-validator");

const validarCita = [
  body("servicioId")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Selecciona un servicio válido")
    .toInt(),

  body("nombreMascota")
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Ingresa un nombre de mascota válido"),

  body("especie")
    .isIn(["Perro", "Gato", "Ave", "Otro"])
    .withMessage("Selecciona una especie válida"),

  body("fecha")
    .isString()
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Ingresa una fecha válida")
    .bail()
    .custom((fecha) => {
      const hoy = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());

      if (fecha < hoy) {
        throw new Error("La fecha no puede ser anterior a hoy");
      }

      return true;
    }),

  body("hora")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Ingresa una hora válida en formato HH:mm"),

  body("motivo")
    .isString()
    .bail()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Ingresa un motivo válido")
];

const validarId = [
  param("id")
    .isInt({ min: 1, max: 2147483647 })
    .withMessage("Identificador de cita inválido")
    .toInt()
];

const validarEstado = [
  body("estado")
    .isIn(["Pendiente", "Confirmada", "Cancelada", "Atendida"])
    .withMessage("Estado de cita inválido")
];

const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: errores.array()
    });
  }

  next();
};

module.exports = {
  validarCita,
  validarId,
  validarEstado,
  verificarValidaciones
};