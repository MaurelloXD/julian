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

module.exports = {
  obtenerTodos,
  guardarTodos,
  crear,
  buscarLineal,
  buscarBinaria,
  ordenarPorPrecio
};
