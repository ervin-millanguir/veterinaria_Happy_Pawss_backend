const express = require("express");
const router = express.Router();

const serviciosController = require("../controllers/servicios.controller");

const {
  autenticar,
  autorizarRoles
} = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     tags: [Servicios]
 *     summary: Listar servicios
 *     description: Obtiene el catálogo de servicios veterinarios.
 *     responses:
 *       200:
 *         description: Servicios obtenidos correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", serviciosController.listar);

/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     tags: [Servicios]
 *     summary: Buscar servicio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Servicio encontrado.
 *       404:
 *         description: Servicio no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/:id", serviciosController.buscarPorId);

/**
 * @swagger
 * /api/servicios:
 *   post:
 *     tags: [Servicios]
 *     summary: Crear servicio
 *     description: Operación exclusiva del administrador.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, descripcion, precio]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Consulta veterinaria
 *               descripcion:
 *                 type: string
 *                 example: Evaluación general de la mascota
 *               precio:
 *                 type: number
 *                 minimum: 0
 *                 example: 15000
 *     responses:
 *       201:
 *         description: Servicio creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: Permisos insuficientes.
 *       500:
 *         description: Error interno del servidor.
 */
router.post("/", autenticar, autorizarRoles("ADMIN"), serviciosController.crear);

/**
 * @swagger
 * /api/servicios/{id}:
 *   put:
 *     tags: [Servicios]
 *     summary: Actualizar servicio
 *     description: Permite al administrador actualizar uno o varios campos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Consulta veterinaria general
 *               descripcion:
 *                 type: string
 *                 example: Evaluación clínica completa
 *               precio:
 *                 type: number
 *                 minimum: 0
 *                 example: 18000
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Permisos insuficientes.
 *       404:
 *         description: Servicio no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put("/:id", autenticar, autorizarRoles("ADMIN"), serviciosController.actualizar);

/**
 * @swagger
 * /api/servicios/{id}:
 *   delete:
 *     tags: [Servicios]
 *     summary: Eliminar servicio
 *     description: Operación exclusiva del administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Servicio eliminado correctamente
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Permisos insuficientes.
 *       404:
 *         description: Servicio no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete("/:id", autenticar, autorizarRoles("ADMIN"), serviciosController.eliminar);

module.exports = router;