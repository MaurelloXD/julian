// models/videojuegoModel.js
//
// El MODEL se encarga UNICAMENTE de los datos:
// leerlos, guardarlos y aplicar las reglas relacionadas con ellos.
// No sabe nada de HTML, ni de peticiones HTTP: eso es trabajo de otras capas.

const fs = require('fs');
const path = require('path');

const RUTA_DATOS = path.join(__dirname, '..', 'data', 'videojuegos.json');

// Lee todos los videojuegos desde el archivo JSON.
function obtenerTodos() {
  const contenido = fs.readFileSync(RUTA_DATOS, 'utf-8');
  return JSON.parse(contenido);
}

// Guarda la lista completa de videojuegos en el archivo JSON.
// Gracias a esto, los cambios (agregar un juego, por ejemplo)
// NO se pierden si el servidor se reinicia.
function guardarTodos(videojuegos) {
  fs.writeFileSync(RUTA_DATOS, JSON.stringify(videojuegos, null, 2), 'utf-8');
}

// Crea un nuevo videojuego y lo agrega a la coleccion.
function crear(nuevoVideojuego) {
  const videojuegos = obtenerTodos();
  const nuevoId = videojuegos.length > 0
    ? Math.max(...videojuegos.map(v => v.id)) + 1
    : 1;

  const videojuego = {
    id: nuevoId,
    nombre: nuevoVideojuego.nombre,
    precio: nuevoVideojuego.precio,
    categoria: nuevoVideojuego.categoria
  };

  videojuegos.push(videojuego);
  guardarTodos(videojuegos);
  return videojuego;
}

module.exports = {
  obtenerTodos,
  guardarTodos,
  crear
};
