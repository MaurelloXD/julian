// controllers/videojuegoController.js
//
// El CONTROLLER recibe la peticion, decide que hacer,
// le pide los datos al Model, y devuelve la respuesta.
// No contiene reglas de negocio complejas ni maneja archivos directamente:
// eso es trabajo del Model.

const videojuegoModel = require('../models/videojuegoModel');
const { validarVideojuego, CATEGORIAS_VALIDAS } = require('../validators/videojuegoValidator');

// GET /api/videojuegos
function obtenerVideojuegos(peticion, respuesta) {
  const videojuegos = videojuegoModel.obtenerTodos();
  respuesta.json(videojuegos);
}

// POST /api/videojuegos
//
// DESPUES de aplicar SRP: esta funcion ya SOLO coordina.
// Le pide la validacion al validador, y si todo esta bien,
// le pide al Model que cree el videojuego. Nada mas.
function crearVideojuego(peticion, respuesta) {
  const { nombre, precio, categoria } = peticion.body;

  const errores = validarVideojuego({ nombre, precio, categoria });
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

// GET /api/categorias
// El front-end pide aqui la lista de categorias validas, en vez de tenerla
// escrita por su cuenta. Asi el formulario y el validador nunca se desincronizan:
// hay una sola fuente de verdad (CATEGORIAS_VALIDAS, en el validador).
function obtenerCategorias(peticion, respuesta) {
  respuesta.json(CATEGORIAS_VALIDAS);
}

// PUT /api/videojuegos/:id
// Actualiza un videojuego existente. Usa el MISMO validador que crear,
// porque las reglas de negocio (nombre valido, precio positivo,
// categoria con longitud razonable) son las mismas al crear o al editar.
function actualizarVideojuego(peticion, respuesta) {
  const { id } = peticion.params;
  const { nombre, precio, categoria } = peticion.body;

  const errores = validarVideojuego({ nombre, precio, categoria });
  if (errores.length > 0) {
    return respuesta.status(400).json({ errores });
  }

  const actualizado = videojuegoModel.actualizar(id, {
    nombre,
    precio: Number(precio),
    categoria
  });

  if (!actualizado) {
    return respuesta.status(404).json({ error: `No existe un videojuego con id ${id}.` });
  }

  respuesta.status(200).json(actualizado);
}

// DELETE /api/videojuegos/:id
function eliminarVideojuego(peticion, respuesta) {
  const { id } = peticion.params;
  const eliminado = videojuegoModel.eliminar(id);

  if (!eliminado) {
    return respuesta.status(404).json({ error: `No existe un videojuego con id ${id}.` });
  }

  respuesta.status(200).json({ mensaje: `Videojuego ${id} eliminado.` });
}

module.exports = {
  obtenerVideojuegos,
  crearVideojuego,
  actualizarVideojuego,
  eliminarVideojuego,
  buscarVideojuego,
  ordenarVideojuegos,
  obtenerEstadisticas,
  obtenerCategorias
};