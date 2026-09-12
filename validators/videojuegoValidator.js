// validators/videojuegoValidator.js
//
// PRINCIPIO SOLID: RESPONSABILIDAD UNICA (SRP)
//
// "Una clase o modulo deberia tener una, y solo una, razon para cambiar."
//
// ANTES: crearVideojuego() en el Controller hacia DOS cosas: validar
// los datos Y coordinar la creacion del videojuego. Si mañana cambian
// las reglas de validacion, tocaria modificar el Controller -- y si
// cambia como se maneja la peticion HTTP, tambien tocaria el mismo
// archivo que valida. Dos razones distintas para cambiar en un mismo lugar:
// eso es justo lo que SRP dice que hay que evitar.
//
// DESPUES (este archivo): la validacion vive sola, en un modulo dedicado.
// Si cambian las reglas de negocio, se edita SOLO este archivo.
// Si cambia la forma de recibir la peticion, se edita SOLO el Controller.

const CATEGORIAS_VALIDAS = ['Aventura', 'Plataformas', 'Accion', 'Deportes', 'Estrategia', 'Deportivo'];

// Recibe los datos crudos de un videojuego y devuelve una lista de errores.
// Si la lista esta vacia, los datos son validos.
function validarVideojuego({ nombre, precio, categoria }) {
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

  return errores;
}

module.exports = { validarVideojuego, CATEGORIAS_VALIDAS };
