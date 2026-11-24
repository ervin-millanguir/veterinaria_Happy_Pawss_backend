const express = require("express");
const authController = require("../controllers/auth.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const {
  validarRegistro,
  validarLogin,
  verificarValidaciones
} = require("../validators/auth.validator");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Registra un usuario con el rol CLIENTE y protege su contraseña mediante Bcrypt.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - rut
 *               - correo
 *               - telefono
 *               - contrasena
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Maria
 *               apellido:
 *                 type: string
 *                 example: Perez
 *               rut:
 *                 type: string
 *                 example: "22222222-2"
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: maria@example.com
 *               telefono:
 *                 type: string
 *                 example: "+56922222222"
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "ClaveFicticia2026!"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Correo o RUT ya registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/register",
  validarRegistro,
  verificarValidaciones,
  authController.registrar
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Valida las credenciales y genera un token JWT.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: maria@example.com
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: "ClaveFicticia2026!"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       429:
 *         description: Demasiados intentos de inicio de sesión
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/login",
  validarLogin,
  verificarValidaciones,
  authController.iniciarSesion
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Consultar perfil del usuario
 *     description: Obtiene los datos del usuario autenticado mediante JWT.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: Token ausente, inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/me",
  autenticar,
  authController.obtenerPerfil
);

module.exports = router;