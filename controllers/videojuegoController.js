// controllers/videojuegoController.js
//
// El CONTROLLER recibe la peticion, decide que hacer,
// le pide los datos al Model, y devuelve la respuesta.
// No contiene reglas de negocio complejas ni maneja archivos directamente:
// eso es trabajo del Model.

const videojuegoModel = require('../models/videojuegoModel');

// GET /api/videojuegos
function obtenerVideojuegos(peticion, respuesta) {
  const videojuegos = videojuegoModel.obtenerTodos();
  respuesta.json(videojuegos);
}

// POST /api/videojuegos
function crearVideojuego(peticion, respuesta) {
  const { nombre, precio, categoria } = peticion.body;

  const nuevoVideojuego = videojuegoModel.crear({
    nombre,
    precio: Number(precio),
    categoria
  });

  respuesta.status(201).json(nuevoVideojuego);
}

module.exports = {
  obtenerVideojuegos,
  crearVideojuego
};
