const express = require("express");
const router = express.Router();

const citasController = require("../controllers/citas.controller");

const {
  autenticar,
  autorizarRoles
} = require("../middlewares/auth.middleware");

const {
  validarCita,
  validarId,
  validarEstado,
  verificarValidaciones
} = require("../validators/citas.validator");

/**
 * @swagger
 * tags:
 *   name: Citas
 *   description: Gestión de citas veterinarias
 */

/**
 * @swagger
 * /api/citas:
 *   post:
 *     summary: Registrar una cita veterinaria
 *     description: Disponible únicamente para clientes autenticados.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - servicioId
 *               - nombreMascota
 *               - especie
 *               - fecha
 *               - hora
 *               - motivo
 *             properties:
 *               servicioId:
 *                 type: integer
 *                 example: 1
 *               nombreMascota:
 *                 type: string
 *                 example: Luna
 *               especie:
 *                 type: string
 *                 enum: [Perro, Gato, Ave, Otro]
 *                 example: Perro
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-01"
 *               hora:
 *                 type: string
 *                 example: "10:30"
 *               motivo:
 *                 type: string
 *                 example: Control veterinario general
 *     responses:
 *       201:
 *         description: Cita registrada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario o servicio inexistente
 *       409:
 *         description: Horario no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  autenticar,
  autorizarRoles("CLIENTE"),
  validarCita,
  verificarValidaciones,
  citasController.crear
);

/**
 * @swagger
 * /api/citas/mis-citas:
 *   get:
 *     summary: Consultar citas propias
 *     description: Devuelve las citas del cliente autenticado.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de citas propias
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/mis-citas",
  autenticar,
  autorizarRoles("CLIENTE"),
  citasController.listarMisCitas
);

/**
 * @swagger
 * /api/citas:
 *   get:
 *     summary: Consultar todas las citas
 *     description: Disponible únicamente para administradores.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado general de citas
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Permisos insuficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/",
  autenticar,
  autorizarRoles("ADMIN"),
  citasController.listar
);

/**
 * @swagger
 * /api/citas/{id}:
 *   get:
 *     summary: Consultar una cita por ID
 *     description: El cliente consulta sus propias citas y el administrador puede consultar todas.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 4
 *     responses:
 *       200:
 *         description: Cita encontrada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Acceso no autorizado
 *       404:
 *         description: Cita no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/:id",
  autenticar,
  autorizarRoles("CLIENTE", "ADMIN"),
  validarId,
  verificarValidaciones,
  citasController.buscarPorId
);

/**
 * @swagger
 * /api/citas/{id}/estado:
 *   patch:
 *     summary: Actualizar el estado de una cita
 *     description: Disponible únicamente para administradores.
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 4
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, Confirmada, Cancelada, Atendida]
 *                 example: Confirmada
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Cita no encontrada
 *       409:
 *         description: Conflicto al actualizar la cita
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
  "/:id/estado",
  autenticar,
  autorizarRoles("ADMIN"),
  validarId,
  validarEstado,
  verificarValidaciones,
  citasController.actualizarEstado
);

module.exports = router;