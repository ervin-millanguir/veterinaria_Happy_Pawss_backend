const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth.middleware');
router.use(verificarToken);
router.get('/', permitirRoles('administrador'), controller.listar);
router.post('/', permitirRoles('administrador'), controller.crear);
router.get('/:id', controller.obtenerPorId);
router.put('/:id', controller.actualizar);
router.delete('/:id', permitirRoles('administrador'), controller.desactivar);
// Compatibilidad con interfaz previa de baja lógica.
router.patch('/:id/desactivar', permitirRoles('administrador'), controller.desactivar);
module.exports = router;
