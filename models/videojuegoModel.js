// models/videojuegoModel.js
//
// El MODEL contiene la LOGICA DE NEGOCIO: reglas de creacion, busqueda,
// ordenamiento y estadisticas. Para leer y guardar los datos, ya NO usa
// fs directamente: le delega esa tarea al Repository (patron Repository).
// Asi, el Model se concentra en el "que" (las reglas) y el Repository
// en el "como" (donde y de que forma se guardan los datos).

const videojuegoRepository = require('../repositories/videojuegoRepository');

function obtenerTodos() {
  return videojuegoRepository.obtenerTodos();
}

function crear(nuevoVideojuego) {
  const videojuegos = videojuegoRepository.obtenerTodos();
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
  videojuegoRepository.guardarTodos(videojuegos);
  return videojuego;
}

// ALGORITMO DE BUSQUEDA LINEAL
// Recorre la lista elemento por elemento, uno a uno, hasta encontrar
// una coincidencia. Funciona sin importar el orden de la lista, pero
// en el peor caso revisa TODOS los elementos.
function buscarLineal(nombreBuscado) {
  const videojuegos = obtenerTodos();
  const nombreNormalizado = nombreBuscado.toLowerCase();
  let comparaciones = 0;

  for (let i = 0; i < videojuegos.length; i++) {
    comparaciones++;
    if (videojuegos[i].nombre.toLowerCase() === nombreNormalizado) {
      return { resultado: videojuegos[i], comparaciones };
    }
  }
  return { resultado: null, comparaciones };
}

// ALGORITMO DE BUSQUEDA BINARIA
// Requiere que la lista este ORDENADA (aqui, por nombre). En cada paso
// descarta la mitad de los elementos restantes, por eso es mucho mas
// rapida que la lineal cuando hay muchos datos.
function buscarBinaria(nombreBuscado) {
  const videojuegos = [...obtenerTodos()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const nombreNormalizado = nombreBuscado.toLowerCase();

  let inicio = 0;
  let fin = videojuegos.length - 1;
  let comparaciones = 0;

  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);
    const nombreMedio = videojuegos[medio].nombre.toLowerCase();
    comparaciones++;

    if (nombreMedio === nombreNormalizado) {
      return { resultado: videojuegos[medio], comparaciones };
    } else if (nombreMedio < nombreNormalizado) {
      inicio = medio + 1;
    } else {
      fin = medio - 1;
    }
  }
  return { resultado: null, comparaciones };
}

// ALGORITMO DE ORDENAMIENTO DE BURBUJA
// Compara elementos adyacentes y los intercambia si estan en el orden
// incorrecto. Repite el recorrido hasta que ya no hay intercambios
// (bandera "huboIntercambio"), lo que evita pasadas innecesarias.
//
// orden: 'asc' (ascendente) o 'desc' (descendente).
function ordenarPorPrecio(orden = 'asc') {
  const videojuegos = [...obtenerTodos()]; // copia, no modificamos el original
  const n = videojuegos.length;

  for (let i = 0; i < n - 1; i++) {
    let huboIntercambio = false;

    for (let j = 0; j < n - 1 - i; j++) {
      const debeIntercambiar = orden === 'asc'
        ? videojuegos[j].precio > videojuegos[j + 1].precio
        : videojuegos[j].precio < videojuegos[j + 1].precio;

      if (debeIntercambiar) {
        const temporal = videojuegos[j];
        videojuegos[j] = videojuegos[j + 1];
        videojuegos[j + 1] = temporal;
        huboIntercambio = true;
      }
    }

    if (!huboIntercambio) break; // ya esta ordenado: no seguimos comparando
  }

  return videojuegos;
}

// ALGORITMO DE PROCESAMIENTO Y AGREGACION
// Recorre la coleccion UNA sola vez, acumulando total, y llevando el
// registro del maximo y el minimo a medida que avanza.
function calcularEstadisticas() {
  const videojuegos = obtenerTodos();

  if (videojuegos.length === 0) {
    return { cantidad: 0, promedio: 0, masCaro: null, masBarato: null };
  }

  let total = 0;
  let masCaro = videojuegos[0];
  let masBarato = videojuegos[0];

  for (const videojuego of videojuegos) {
    total += videojuego.precio;
    if (videojuego.precio > masCaro.precio) masCaro = videojuego;
    if (videojuego.precio < masBarato.precio) masBarato = videojuego;
  }

  return {
    cantidad: videojuegos.length,
    promedio: Math.round(total / videojuegos.length),
    masCaro,
    masBarato
  };
}

module.exports = {
  obtenerTodos,
  crear,
  buscarLineal,
  buscarBinaria,
  ordenarPorPrecio,
  calcularEstadisticas
};
