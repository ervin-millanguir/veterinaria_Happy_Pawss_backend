const express = require("express");
const authController = require("../controllers/auth.controller");
const { verificarToken } = require("../middleware/auth.middleware");
const {
  validarRegistro,
  validarLogin,
  verificarValidaciones
} = require("../validators/auth.validator");

const router = express.Router();

const registrarConRol = (rol) => (req, res, next) => {
  req.rolRegistro = rol;
  next();
};

router.post(
  "/register",
  validarRegistro,
  verificarValidaciones,
  registrarConRol("CLIENTE"),
  authController.registrar
);

router.post(
  "/registro",
  validarRegistro,
  verificarValidaciones,
  registrarConRol("dueno_mascota"),
  authController.registrar
);

router.post(
  "/login",
  validarLogin,
  verificarValidaciones,
  authController.iniciarSesion
);

router.get(
  "/me",
  verificarToken,
  authController.obtenerPerfil
);

module.exports = router;
