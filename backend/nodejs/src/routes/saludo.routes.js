const express = require("express");
const router = express.Router();

const { obtenerSaludo } = require("../controllers/saludo.controller");

/**
 * @swagger
 * /api/saludo:
 *   get:
 *     summary: Comprobar el funcionamiento de la API
 *     description: Devuelve un saludo personalizado sin requerir autenticación.
 *     tags: [Saludo]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: false
 *         schema:
 *           type: string
 *           default: estudiante
 *         example: Duoc
 *         description: Nombre de la persona que recibe el saludo.
 *     responses:
 *       200:
 *         description: Saludo generado correctamente
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Hola, Duoc"
 *               backend: "Node.js + Express en EC2"
 *               lenguaje: "Node.js"
 *               estado: "OK"
 */
router.get("/", obtenerSaludo);

module.exports = router;