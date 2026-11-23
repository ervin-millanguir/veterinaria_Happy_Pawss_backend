const express = require("express");
const router = express.Router();

const serviciosController = require("../controllers/servicios.controller");

router.get("/", serviciosController.listar);
router.get("/:id", serviciosController.buscarPorId);
router.post("/", serviciosController.crear);
router.put("/:id", serviciosController.actualizar);
router.delete("/:id", serviciosController.eliminar);

module.exports = router;