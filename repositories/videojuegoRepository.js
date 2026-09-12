// repositories/videojuegoRepository.js
//
// PATRON DE DISEÑO: REPOSITORY
//
// Antes, el Model leia y escribia el archivo JSON directamente con fs.
// Ahora, esa responsabilidad se centraliza aqui: el Repository es el
// UNICO lugar del proyecto que sabe COMO se guardan los datos.
//
// Ventaja practica: si mañana cambiamos de un archivo JSON a una base
// de datos real (MySQL, MongoDB, etc.), solo hay que reescribir este
// archivo. El Model y el Controller no se enteran del cambio, porque
// ellos solo conocen los metodos obtenerTodos() y guardarTodos().

const fs = require('fs');
const path = require('path');

const RUTA_DATOS = path.join(__dirname, '..', 'data', 'videojuegos.json');

function obtenerTodos() {
  const contenido = fs.readFileSync(RUTA_DATOS, 'utf-8');
  return JSON.parse(contenido);
}

function guardarTodos(videojuegos) {
  fs.writeFileSync(RUTA_DATOS, JSON.stringify(videojuegos, null, 2), 'utf-8');
}

module.exports = { obtenerTodos, guardarTodos };
