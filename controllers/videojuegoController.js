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

// Categorias permitidas en la tienda.
const CATEGORIAS_VALIDAS = ['Aventura', 'Plataformas', 'Accion', 'Deportes', 'Estrategia', 'Deportivo'];

// POST /api/videojuegos
//
// NOTA PEDAGOGICA (a proposito, temporal):
// Esta funcion esta haciendo DOS cosas a la vez: validar los datos
// Y coordinar la creacion del videojuego. Mas adelante, en el commit
// de "Aplicar SRP", vamos a separar la validacion en su propio modulo.
// Por ahora, dejemoslo asi para poder mostrar el "antes" en clase.
function crearVideojuego(peticion, respuesta) {
  const { nombre, precio, categoria } = peticion.body;
  const errores = [];

  if (!nombre || nombre.trim() === '') {
    errores.push('El nombre no puede estar vacio.');
  }
  if (precio === undefined || Number(precio) <= 0 || isNaN(Number(precio))) {
    errores.push('El precio debe ser un numero mayor que cero.');
  }
  if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) {
    errores.push(`La categoria debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}.`);
  }

  if (errores.length > 0) {
    return respuesta.status(400).json({ errores });
  }

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

// GET /api/videojuegos/estadisticas
function obtenerEstadisticas(peticion, respuesta) {
  const estadisticas = videojuegoModel.calcularEstadisticas();
  respuesta.json(estadisticas);
}

module.exports = {
  obtenerVideojuegos,
  crearVideojuego,
  buscarVideojuego,
  ordenarVideojuegos,
  obtenerEstadisticas
};
