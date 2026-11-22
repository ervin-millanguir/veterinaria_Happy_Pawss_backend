const express = require("express");
const router = express.Router();

const { obtenerSaludo } = require("../controllers/saludo.controller");

router.get("/", obtenerSaludo);

module.exports = router;