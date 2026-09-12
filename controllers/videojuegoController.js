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

// GET /api/videojuegos/buscar?nombre=Minecraft
// Ejecuta AMBAS busquedas sobre el mismo nombre y devuelve cuantas
// comparaciones hizo cada una, para poder compararlas en clase.
function buscarVideojuego(peticion, respuesta) {
  const { nombre } = peticion.query;

  if (!nombre) {
    return respuesta.status(400).json({ error: 'Debes indicar un nombre para buscar.' });
  }

  const porLineal = videojuegoModel.buscarLineal(nombre);
  const porBinaria = videojuegoModel.buscarBinaria(nombre);

  respuesta.json({
    encontrado: porLineal.resultado,
    comparaciones: {
      lineal: porLineal.comparaciones,
      binaria: porBinaria.comparaciones
    }
  });
}

// GET /api/videojuegos/ordenar?orden=asc  (o orden=desc)
function ordenarVideojuegos(peticion, respuesta) {
  const { orden } = peticion.query;
  const videojuegosOrdenados = videojuegoModel.ordenarPorPrecio(orden === 'desc' ? 'desc' : 'asc');
  respuesta.json(videojuegosOrdenados);
}

module.exports = {
  obtenerVideojuegos,
  crearVideojuego,
  buscarVideojuego,
  ordenarVideojuegos
};
