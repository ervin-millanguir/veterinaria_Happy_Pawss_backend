const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');
router.post('/registro', controller.registrar);
router.post('/login', controller.iniciarSesion);
router.get('/me', verificarToken, (req, res) => res.json({ usuario: req.usuario }));
module.exports = router;
