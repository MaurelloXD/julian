// routes/videojuegoRoutes.js
//
// Aqui se define QUE URL corresponde a QUE funcion del Controller.
// GET -> consultar informacion.
// POST -> enviar informacion para crear algo nuevo.

const express = require('express');
const router = express.Router();
const videojuegoController = require('../controllers/videojuegoController');

router.get('/videojuegos', videojuegoController.obtenerVideojuegos);
router.post('/videojuegos', videojuegoController.crearVideojuego);

module.exports = router;
