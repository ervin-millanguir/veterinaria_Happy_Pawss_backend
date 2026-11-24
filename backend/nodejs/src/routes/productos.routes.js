const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productos.controller");

const {
  autenticar,
  autorizarRoles
} = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/productos:
 *   get:
 *     tags: [Productos]
 *     summary: Listar productos
 *     description: Obtiene el catálogo de productos sin autenticación.
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente.
 *       500:
 *         description: Error interno del servidor.
 */
router.get("/", productosController.listar);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Buscar producto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado.
 *       404:
 *         description: Producto no encontrado.
 */
router.get("/:id", productosController.buscarPorId);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     tags: [Productos]
 *     summary: Crear producto
 *     description: Operación exclusiva del administrador.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, precio, stock]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Alimento para perros
 *               precio:
 *                 type: number
 *                 minimum: 0
 *                 example: 15990
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 20
 *     responses:
 *       201:
 *         description: Producto creado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Token requerido, inválido o expirado.
 *       403:
 *         description: Permisos insuficientes.
 */
router.post("/", autenticar, autorizarRoles("ADMIN"), productosController.crear);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar producto
 *     description: Operación exclusiva del administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Alimento premium para perros
 *               precio:
 *                 type: number
 *                 minimum: 0
 *                 example: 19990
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 30
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Permisos insuficientes.
 *       404:
 *         description: Producto no encontrado.
 */
router.put("/:id", autenticar, autorizarRoles("ADMIN"), productosController.actualizar);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     tags: [Productos]
 *     summary: Eliminar producto
 *     description: Operación exclusiva del administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Permisos insuficientes.
 *       404:
 *         description: Producto no encontrado.
 */
router.delete("/:id", autenticar, autorizarRoles("ADMIN"), productosController.eliminar);

module.exports = router;