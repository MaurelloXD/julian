// routes/videojuegoRoutes.js
//
// Aqui se define QUE URL corresponde a QUE funcion del Controller.
// GET -> consultar informacion.
// POST -> enviar informacion para crear algo nuevo.

const express = require('express');
const router = express.Router();
const videojuegoController = require('../controllers/videojuegoController');

router.get('/videojuegos', videojuegoController.obtenerVideojuegos);
router.get('/videojuegos/buscar', videojuegoController.buscarVideojuego);
router.get('/videojuegos/ordenar', videojuegoController.ordenarVideojuegos);
router.get('/videojuegos/estadisticas', videojuegoController.obtenerEstadisticas);
router.get('/categorias', videojuegoController.obtenerCategorias);
router.post('/videojuegos', videojuegoController.crearVideojuego);
router.put('/videojuegos/:id', videojuegoController.actualizarVideojuego);
router.delete('/videojuegos/:id', videojuegoController.eliminarVideojuego);

module.exports = router;