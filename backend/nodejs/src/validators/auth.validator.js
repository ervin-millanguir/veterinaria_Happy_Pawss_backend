const { body, validationResult } = require("express-validator");

const validarRegistro = [
  body("nombre")
    .isString()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("El nombre debe tener entre 2 y 120 caracteres"),

  body("apellido")
    .isString()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("El apellido debe tener entre 2 y 120 caracteres"),

  body("rut")
    .optional({ checkFalsy: true })
    .isString()
    .bail()
    .trim()
    .customSanitizer(rut => rut.replace(/\./g, "").toUpperCase())
    .matches(/^\d{7,8}-[\dK]$/)
    .withMessage("El formato del RUT no es válido"),

  body("correo")
    .isString()
    .bail()
    .trim()
    .isEmail()
    .isLength({ max: 254 })
    .withMessage("El correo no es válido")
    .customSanitizer(correo => correo.toLowerCase()),

  body("telefono")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .matches(/^\+?\d{8,15}$/)
    .withMessage("El teléfono no es válido"),

  body("contrasena")
    .isString()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .bail()
    .custom(valor => Buffer.byteLength(valor, "utf8") <= 72)
    .withMessage("La contraseña supera el límite permitido")
];

const validarLogin = [
  body("correo")
    .isString()
    .trim()
    .isEmail()
    .withMessage("El correo no es válido"),

  body("contrasena")
    .isString()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
];

const verificarValidaciones = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: errores.array().map(error => ({
        campo: error.path,
        mensaje: error.msg
      }))
    });
  }

  next();
};

module.exports = {
  validarRegistro,
  validarLogin,
  verificarValidaciones
};