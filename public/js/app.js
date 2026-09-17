// public/js/app.js
//
// Este codigo NO se ejecuta en el servidor: se ejecuta en el navegador
// del usuario (Front-End). Su trabajo es: pedir datos al servidor,
// recibir la respuesta y actualizar lo que se ve en pantalla, SIN
// recargar la pagina. Esto es lo que da la sensacion de "tiempo real".

const listaVideojuegos = document.getElementById('lista-videojuegos');
const formAgregar = document.getElementById('form-agregar');
const mensajeAgregar = document.getElementById('mensaje-agregar');

// Pide la lista de videojuegos al servidor y la dibuja en pantalla.
async function cargarVideojuegos() {
  const respuesta = await fetch('/api/videojuegos');
  const videojuegos = await respuesta.json();
  renderizarVideojuegos(videojuegos);
}

// Cada categoria tiene su propio color, definido en el CSS. Esta funcion
// solo traduce el nombre de la categoria a la variable de color correcta.
function claseColorCategoria(categoria) {
  const mapa = {
    'Aventura': 'var(--cat-aventura)',
    'Plataformas': 'var(--cat-plataformas)',
    'Accion': 'var(--cat-accion)',
    'Deportes': 'var(--cat-deportes)',
    'Estrategia': 'var(--cat-estrategia)',
    'Deportivo': 'var(--cat-deportivo)'
  };
  return mapa[categoria] || 'var(--cat-default)';
}

// Toma un arreglo de videojuegos y construye el HTML de la lista.
function renderizarVideojuegos(videojuegos) {
  listaVideojuegos.innerHTML = '';

  videojuegos.forEach(videojuego => {
    const item = document.createElement('li');

    const textoJuego = document.createElement('span');
    textoJuego.textContent = `${videojuego.nombre} - $${videojuego.precio.toLocaleString('es-CO')}`;

    const badge = document.createElement('span');
    badge.className = 'badge-categoria';
    badge.textContent = videojuego.categoria;
    badge.style.backgroundColor = claseColorCategoria(videojuego.categoria);

    item.appendChild(textoJuego);
    item.appendChild(badge);
    listaVideojuegos.appendChild(item);
  });
}

// Envia el formulario al servidor mediante POST, sin recargar la pagina.
formAgregar.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nuevoVideojuego = {
    nombre: document.getElementById('input-nombre').value,
    precio: document.getElementById('input-precio').value,
    categoria: document.getElementById('input-categoria').value
  };

  const respuesta = await fetch('/api/videojuegos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoVideojuego)
  });

  const datos = await respuesta.json();

  if (respuesta.ok) {
    mensajeAgregar.textContent = 'Videojuego agregado con exito.';
    formAgregar.reset();
    cargarVideojuegos(); // Volvemos a pedir la lista actualizada: esto se ve "en vivo"
  } else {
    mensajeAgregar.textContent = 'Errores: ' + datos.errores.join(' ');
  }
});

// --- Busqueda ---
const formBuscar = document.getElementById('form-buscar');
const resultadoBusqueda = document.getElementById('resultado-busqueda');

formBuscar.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const nombre = document.getElementById('input-buscar').value;

  const respuesta = await fetch(`/api/videojuegos/buscar?nombre=${encodeURIComponent(nombre)}`);
  const datos = await respuesta.json();

  if (datos.encontrado) {
    resultadoBusqueda.textContent =
      `Encontrado: ${datos.encontrado.nombre} - $${datos.encontrado.precio.toLocaleString('es-CO')} ` +
      `(lineal: ${datos.comparaciones.lineal} comparaciones, binaria: ${datos.comparaciones.binaria} comparaciones)`;
  } else {
    resultadoBusqueda.textContent = 'No se encontro ese videojuego.';
  }
});

// --- Ordenamiento ---
async function ordenarPorPrecio(orden) {
  const respuesta = await fetch(`/api/videojuegos/ordenar?orden=${orden}`);
  const videojuegos = await respuesta.json();
  renderizarVideojuegos(videojuegos);
}

document.getElementById('btn-orden-asc').addEventListener('click', () => ordenarPorPrecio('asc'));
document.getElementById('btn-orden-desc').addEventListener('click', () => ordenarPorPrecio('desc'));

// --- Estadisticas ---
async function cargarEstadisticas() {
  const respuesta = await fetch('/api/videojuegos/estadisticas');
  const stats = await respuesta.json();

  const lista = document.getElementById('lista-estadisticas');
  lista.innerHTML = `
    <li>Cantidad de videojuegos: ${stats.cantidad}</li>
    <li>Precio promedio: $${stats.promedio.toLocaleString('es-CO')}</li>
    <li>Mas caro: ${stats.masCaro ? stats.masCaro.nombre : '-'}</li>
    <li>Mas barato: ${stats.masBarato ? stats.masBarato.nombre : '-'}</li>
  `;
}

document.getElementById('btn-cargar-estadisticas').addEventListener('click', cargarEstadisticas);

// Al cargar la pagina por primera vez, pedimos los videojuegos y las estadisticas.
cargarVideojuegos();
cargarEstadisticas();
