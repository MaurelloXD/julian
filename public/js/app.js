// public/js/app.js
//
// Este codigo se ejecuta en el navegador (Front-End). Pide datos al
// servidor, actualiza la pantalla sin recargar, y ademas alimenta el
// panel "Sala de maquinas": una traduccion narrada de cada peticion
// HTTP, tanto en lenguaje de restaurante como en lenguaje tecnico MVC.

const listaVideojuegos = document.getElementById('lista-videojuegos');
const formAgregar = document.getElementById('form-agregar');
const mensajeAgregar = document.getElementById('mensaje-agregar');
const logTerminal = document.getElementById('log-terminal');

// ============================================================
// LOS 4 ACTORES: mismo rol, dos idiomas (restaurante / tecnico)
// ============================================================
const ACTORES = {
  view: {
    icono: '🧑',
    restaurante: 'Jugador',
    tecnico: 'View',
    descRestaurante: 'Es quien usa la tienda: busca, agrega y compra videojuegos. Todo lo hace desde su mesa (la pantalla).',
    descTecnico: 'Es la interfaz (HTML/CSS/JS) que el usuario ve y con la que interactua. No sabe nada de logica de negocio.'
  },
  controller: {
    icono: '🧑‍💼',
    restaurante: 'Mesero',
    tecnico: 'Controller',
    descRestaurante: 'Recibe el pedido del jugador, lo lleva a la cocina y despues trae el resultado de vuelta a la mesa.',
    descTecnico: 'Recibe la peticion HTTP, coordina al Model y al Repository, y devuelve la respuesta. No contiene reglas de negocio.'
  },
  model: {
    icono: '👨‍🍳',
    restaurante: 'Cocinero',
    tecnico: 'Model',
    descRestaurante: 'Aplica las recetas: valida los ingredientes, busca, ordena y calcula. El sabe las reglas del restaurante.',
    descTecnico: 'Contiene la logica de negocio y los algoritmos: validacion, busqueda, ordenamiento y estadisticas.'
  },
  repository: {
    icono: '📦',
    restaurante: 'Bodeguero',
    tecnico: 'Repository',
    descRestaurante: 'Es el unico que entra a la bodega. Si el inventario viviera en otro lugar, solo el bodeguero se enteraria.',
    descTecnico: 'Es el unico que abre y guarda data/videojuegos.json. Si el dato viviera en otro lugar, solo este archivo cambiaria.'
  }
};

// Estado del panel: que pestana esta activa, que actor esta seleccionado,
// y cuales fueron los pasos de la ultima accion realizada.
let tabActiva = 'restaurante';
let actorSeleccionado = 'view';
let pasosActuales = [];

// ============================================================
// PETICIONES HTTP: wrapper que registra cada llamada
// ============================================================
async function peticionHTTP(url, opciones = {}) {
  const metodo = (opciones.method || 'GET').toUpperCase();
  const respuesta = await fetch(url, opciones);
  registrarEnTerminal(metodo, url, respuesta.status);
  return respuesta;
}

function registrarEnTerminal(metodo, url, estado) {
  const hora = new Date().toLocaleTimeString('es-CO', { hour12: false });
  const linea = document.createElement('div');
  linea.textContent = `[${hora}] ${metodo}  ${url}  · ${estado}`;
  logTerminal.insertBefore(linea, logTerminal.firstChild);
  while (logTerminal.children.length > 6) {
    logTerminal.removeChild(logTerminal.lastChild);
  }
}

// ============================================================
// SALA DE MAQUINAS: render de actores, descripcion, pasos y JSON
// ============================================================
function renderizarActores() {
  const contenedor = document.getElementById('actores-fila');
  contenedor.innerHTML = '';

  Object.entries(ACTORES).forEach(([clave, actor]) => {
    const boton = document.createElement('button');
    boton.className = 'actor-btn' + (clave === actorSeleccionado ? ' activo' : '');
    boton.innerHTML = `<span class="icono">${actor.icono}</span>${tabActiva === 'tecnico' ? actor.tecnico : actor.restaurante}`;
    boton.addEventListener('click', () => {
      actorSeleccionado = clave;
      renderizarActores();
      renderizarDescripcionActor();
    });
    contenedor.appendChild(boton);
  });
}

function renderizarDescripcionActor() {
  const actor = ACTORES[actorSeleccionado];
  const texto = tabActiva === 'tecnico' ? actor.descTecnico : actor.descRestaurante;
  document.getElementById('descripcion-actor').textContent = texto;
}

function renderizarPasos() {
  const lista = document.getElementById('lista-pasos');

  if (pasosActuales.length === 0) {
    lista.innerHTML = '<li class="paso-vacio">Todavia no has hecho ninguna accion. Busca, ordena o agrega un videojuego para ver los pasos aqui.</li>';
    return;
  }

  lista.innerHTML = '';
  pasosActuales.forEach(paso => {
    const item = document.createElement('li');
    item.className = `paso-item paso-actor-${paso.actor}`;
    item.textContent = tabActiva === 'tecnico' ? paso.tecnico : paso.restaurante;
    lista.appendChild(item);
  });
}

function renderizarJson() {
  const pre = document.getElementById('json-crudo');
  pre.textContent = JSON.stringify(pasosActuales, null, 2);
}

// Cambia de pestana: solo cambia el IDIOMA mostrado (restaurante/tecnico/json),
// los datos de fondo (pasosActuales) son siempre los mismos.
document.querySelectorAll('.tab-sala').forEach(boton => {
  boton.addEventListener('click', () => {
    tabActiva = boton.dataset.tab;
    document.querySelectorAll('.tab-sala').forEach(b => b.classList.remove('activa'));
    boton.classList.add('activa');

    const esJson = tabActiva === 'json';
    document.getElementById('actores-fila').style.display = esJson ? 'none' : 'grid';
    document.getElementById('descripcion-actor').style.display = esJson ? 'none' : 'block';
    document.getElementById('json-crudo').style.display = esJson ? 'block' : 'none';
    document.getElementById('abrir-json').style.display = esJson ? 'inline-block' : 'none';

    renderizarActores();
    renderizarDescripcionActor();
    renderizarPasos();
    renderizarJson();
  });
});

document.getElementById('abrir-json').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(pasosActuales, null, 2)], { type: 'application/json' });
  window.open(URL.createObjectURL(blob), '_blank');
});

// Actualiza la bitacora completa (pasos + JSON) con el resultado de la
// ultima accion realizada, y la pinta segun la pestana activa.
function actualizarBitacora(nuevosPasos) {
  pasosActuales = nuevosPasos;
  renderizarPasos();
  renderizarJson();
}

// ============================================================
// GENERADORES DE PASOS: una funcion por cada accion de la tienda.
// Cada paso tiene: codigo (id interno), actor (view/controller/model/
// repository) y su narracion en restaurante y en tecnico.
// ============================================================
function pasosBuscar(nombre, comparaciones) {
  return [
    { codigo: 'input_usuario', actor: 'view', restaurante: `Pides al mesero que busque "${nombre}" en el menu.`, tecnico: `El usuario escribe "${nombre}" y envia el formulario de busqueda.` },
    { codigo: 'http_salida', actor: 'controller', restaurante: 'El mesero anota el pedido y lo lleva a la cocina.', tecnico: `GET /api/videojuegos/buscar?nombre=${encodeURIComponent(nombre)}` },
    { codigo: 'repo_lee', actor: 'repository', restaurante: 'El bodeguero trae el inventario completo desde la bodega.', tecnico: 'El Repository lee data/videojuegos.json.' },
    { codigo: 'model_busca', actor: 'model', restaurante: 'El cocinero revisa los ingredientes uno por uno, y tambien por la mitad si ya estan ordenados.', tecnico: `El Model ejecuta busqueda lineal y binaria (lineal: ${comparaciones.lineal}, binaria: ${comparaciones.binaria} comparaciones).` },
    { codigo: 'http_entrada', actor: 'controller', restaurante: 'El mesero trae el resultado de vuelta a tu mesa.', tecnico: 'Respuesta 200 OK con el resultado y el conteo de comparaciones.' },
    { codigo: 'view_final', actor: 'view', restaurante: 'Ves en tu mesa si el plato existe.', tecnico: 'La Vista muestra el resultado de la busqueda en pantalla.' }
  ];
}

function pasosOrdenar(orden) {
  const direccion = orden === 'desc' ? 'de mayor a menor precio' : 'de menor a mayor precio';
  return [
    { codigo: 'input_usuario', actor: 'view', restaurante: `Pides el menu ordenado ${direccion}.`, tecnico: `El usuario hace clic en "Ordenar por precio" (${orden}).` },
    { codigo: 'http_salida', actor: 'controller', restaurante: 'El pedido sale hacia la cocina.', tecnico: `GET /api/videojuegos/ordenar?orden=${orden}` },
    { codigo: 'repo_lee', actor: 'repository', restaurante: 'El bodeguero saca todos los productos del estante.', tecnico: 'El Repository lee data/videojuegos.json.' },
    { codigo: 'model_ordena', actor: 'model', restaurante: 'El cocinero reordena los platos en la bandeja, comparando de a dos.', tecnico: 'El Model ejecuta el algoritmo de ordenamiento burbuja.' },
    { codigo: 'http_entrada', actor: 'controller', restaurante: 'El menu ordenado llega a tu mesa.', tecnico: 'Respuesta 200 OK con la lista ordenada.' },
    { codigo: 'view_final', actor: 'view', restaurante: 'Ves el menu ya ordenado.', tecnico: 'La Vista pinta la lista ordenada.' }
  ];
}

function pasosAgregar(datos, exito, errores) {
  const pasos = [
    { codigo: 'input_usuario', actor: 'view', restaurante: `Le pides al mesero agregar "${datos.nombre}" al menu.`, tecnico: 'El usuario llena el formulario y lo envia.' },
    { codigo: 'http_salida', actor: 'controller', restaurante: 'El mesero lleva la solicitud a la cocina.', tecnico: 'POST /api/videojuegos' },
    { codigo: 'model_valida', actor: 'model', restaurante: 'El cocinero revisa que los ingredientes tengan sentido antes de cocinar.', tecnico: 'El Validator revisa nombre, precio y categoria.' }
  ];

  if (!exito) {
    pasos.push({ codigo: 'error', actor: 'model', restaurante: 'El cocinero rechaza el pedido: algo no cuadra.', tecnico: `Errores de validacion: ${errores.join(' ')}` });
    pasos.push({ codigo: 'http_entrada', actor: 'controller', restaurante: 'El mesero regresa a decirte que el pedido no se puede preparar.', tecnico: 'Respuesta 400 con la lista de errores.' });
    pasos.push({ codigo: 'view_final', actor: 'view', restaurante: 'Ves el mensaje de error en tu mesa.', tecnico: 'La Vista muestra los errores debajo del formulario.' });
    return pasos;
  }

  pasos.push({ codigo: 'repo_escribe', actor: 'repository', restaurante: 'El bodeguero agrega el producto nuevo al estante y actualiza el inventario.', tecnico: 'El Repository escribe el nuevo registro en data/videojuegos.json.' });
  pasos.push({ codigo: 'http_entrada', actor: 'controller', restaurante: 'El mesero confirma que el plato ya esta en el menu.', tecnico: 'Respuesta 201 Created con el videojuego guardado.' });
  pasos.push({ codigo: 'view_final', actor: 'view', restaurante: 'Ves el nuevo plato aparecer en el menu, sin recargar la mesa.', tecnico: 'La Vista vuelve a pedir la lista y la repinta.' });
  return pasos;
}

function pasosEstadisticas(stats) {
  return [
    { codigo: 'input_usuario', actor: 'view', restaurante: 'Le pides al mesero un resumen del negocio.', tecnico: 'El usuario hace clic en "Actualizar estadisticas".' },
    { codigo: 'http_salida', actor: 'controller', restaurante: 'El mesero pide el resumen a la cocina.', tecnico: 'GET /api/videojuegos/estadisticas' },
    { codigo: 'repo_lee', actor: 'repository', restaurante: 'El bodeguero entrega el inventario completo.', tecnico: 'El Repository lee data/videojuegos.json.' },
    { codigo: 'model_calcula', actor: 'model', restaurante: `El cocinero suma, promedia y encuentra el plato mas caro (${stats.masCaro ? stats.masCaro.nombre : '-'}) y el mas barato (${stats.masBarato ? stats.masBarato.nombre : '-'}).`, tecnico: 'El Model recorre la coleccion una sola vez acumulando total, maximo y minimo.' },
    { codigo: 'http_entrada', actor: 'controller', restaurante: 'El resumen llega a tu mesa.', tecnico: 'Respuesta 200 OK con las estadisticas calculadas.' },
    { codigo: 'view_final', actor: 'view', restaurante: 'Ves el resumen del negocio en tu mesa.', tecnico: 'La Vista pinta las tarjetas de estadisticas.' }
  ];
}

function pasosActualizar(datos, exito, errores) {
  const pasos = [
    { codigo: 'input_usuario', actor: 'view', restaurante: `Le pides al mesero cambiar "${datos.nombre}" en el menu.`, tecnico: 'El usuario edita el formulario (precargado) y lo envia.' },
    { codigo: 'http_salida', actor: 'controller', restaurante: 'El mesero lleva el cambio a la cocina.', tecnico: `PUT /api/videojuegos/${datos.id}` },
    { codigo: 'model_valida', actor: 'model', restaurante: 'El cocinero revisa que la receta modificada siga teniendo sentido.', tecnico: 'El Validator revisa los datos nuevos con las mismas reglas que al crear.' }
  ];

  if (!exito) {
    pasos.push({ codigo: 'error', actor: 'model', restaurante: 'El cocinero rechaza el cambio: algo no cuadra.', tecnico: `Errores de validacion: ${errores.join(' ')}` });
    pasos.push({ codigo: 'http_entrada', actor: 'controller', restaurante: 'El mesero te avisa que el cambio no se pudo aplicar.', tecnico: 'Respuesta 400 con la lista de errores.' });
    pasos.push({ codigo: 'view_final', actor: 'view', restaurante: 'Ves el error en tu mesa.', tecnico: 'La Vista muestra los errores debajo del formulario.' });
    return pasos;
  }

  pasos.push({ codigo: 'repo_actualiza', actor: 'repository', restaurante: 'El bodeguero reemplaza el producto viejo por la version actualizada en el estante.', tecnico: 'El Repository reescribe ese registro en data/videojuegos.json.' });
  pasos.push({ codigo: 'http_entrada', actor: 'controller', restaurante: 'El mesero confirma que el cambio ya esta aplicado.', tecnico: 'Respuesta 200 OK con el videojuego actualizado.' });
  pasos.push({ codigo: 'view_final', actor: 'view', restaurante: 'Ves el plato actualizado en el menu.', tecnico: 'La Vista vuelve a pedir la lista y la repinta.' });
  return pasos;
}

function pasosEliminar(nombre) {
  return [
    { codigo: 'input_usuario', actor: 'view', restaurante: `Le pides al mesero retirar "${nombre}" del menu.`, tecnico: 'El usuario confirma la eliminacion en la ventana emergente.' },
    { codigo: 'http_salida', actor: 'controller', restaurante: 'El mesero avisa en la bodega que ese producto ya no se vende.', tecnico: 'DELETE /api/videojuegos/:id' },
    { codigo: 'repo_elimina', actor: 'repository', restaurante: 'El bodeguero saca el producto del estante y lo descarta del inventario.', tecnico: 'El Repository reescribe data/videojuegos.json sin ese registro.' },
    { codigo: 'http_entrada', actor: 'controller', restaurante: 'El mesero confirma que ya no esta en el menu.', tecnico: 'Respuesta 200 OK confirmando la eliminacion.' },
    { codigo: 'view_final', actor: 'view', restaurante: 'Ves que el plato desaparecio del menu.', tecnico: 'La Vista vuelve a pedir la lista y la repinta sin ese elemento.' }
  ];
}

// ============================================================
// LISTADO DE VIDEOJUEGOS
// ============================================================
async function cargarVideojuegos() {
  const respuesta = await peticionHTTP('/api/videojuegos');
  const videojuegos = await respuesta.json();
  renderizarVideojuegos(videojuegos);
}

function claseColorCategoria(categoria) {
  const mapa = {
    'Aventura': 'var(--cat-aventura)', 'Plataformas': 'var(--cat-plataformas)',
    'Accion': 'var(--cat-accion)', 'Deportes': 'var(--cat-deportes)',
    'Estrategia': 'var(--cat-estrategia)', 'Deportivo': 'var(--cat-deportivo)'
  };
  return mapa[categoria] || 'var(--cat-default)';
}

let videojuegosEnMemoria = [];

function renderizarVideojuegos(videojuegos) {
  videojuegosEnMemoria = videojuegos;
  listaVideojuegos.innerHTML = '';

  videojuegos.forEach(videojuego => {
    const item = document.createElement('li');
    item.innerHTML = `
      <span class="nombre-juego">${videojuego.nombre}</span>
      <span class="badge-categoria" style="color:${claseColorCategoria(videojuego.categoria)}">${videojuego.categoria}</span>
      <span class="precio-juego">$${videojuego.precio.toLocaleString('es-CO')}</span>
      <span class="acciones-juego">
        <button type="button" class="btn-mini btn-editar" data-id="${videojuego.id}">Editar</button>
        <button type="button" class="btn-mini btn-eliminar" data-id="${videojuego.id}">Eliminar</button>
      </span>
    `;
    listaVideojuegos.appendChild(item);
  });

  // Los botones se crean de nuevo cada vez que se repinta la lista,
  // asi que sus eventos de clic se enganchan aqui, despues de crearlos.
  document.querySelectorAll('.btn-editar').forEach(boton => {
    boton.addEventListener('click', () => entrarModoEdicion(Number(boton.dataset.id)));
  });
  document.querySelectorAll('.btn-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarVideojuego(Number(boton.dataset.id)));
  });
}

document.getElementById('btn-ver-todos').addEventListener('click', cargarVideojuegos);

// ============================================================
// CATEGORIAS (select dinamico + opcion "Otra")
// ============================================================
const selectCategoria = document.getElementById('input-categoria');
const labelOtraCategoria = document.getElementById('label-otra-categoria');
const inputOtraCategoria = document.getElementById('input-otra-categoria');
const VALOR_OTRA = '__otra__';

async function cargarCategorias() {
  const respuesta = await peticionHTTP('/api/categorias');
  const categorias = await respuesta.json();

  selectCategoria.innerHTML = '';
  categorias.forEach(categoria => {
    const opcion = document.createElement('option');
    opcion.value = categoria;
    opcion.textContent = categoria;
    selectCategoria.appendChild(opcion);
  });

  const opcionOtra = document.createElement('option');
  opcionOtra.value = VALOR_OTRA;
  opcionOtra.textContent = 'Otra (especificar)';
  selectCategoria.appendChild(opcionOtra);
}

selectCategoria.addEventListener('change', () => {
  const esOtra = selectCategoria.value === VALOR_OTRA;
  labelOtraCategoria.style.display = esOtra ? 'flex' : 'none';
  inputOtraCategoria.required = esOtra;
  if (!esOtra) inputOtraCategoria.value = '';
});

// ============================================================
// EDITAR Y ELIMINAR
// ============================================================
let idEnEdicion = null; // null = modo "agregar". Un numero = modo "editar".

const tituloFormAgregar = document.getElementById('titulo-form-agregar');
const btnSubmitAgregar = document.getElementById('btn-submit-agregar');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

// Precarga el formulario con los datos del videojuego elegido, y
// cambia el formulario a modo "edicion".
function entrarModoEdicion(id) {
  const videojuego = videojuegosEnMemoria.find(v => v.id === id);
  if (!videojuego) return;

  idEnEdicion = id;
  document.getElementById('input-nombre').value = videojuego.nombre;
  document.getElementById('input-precio').value = videojuego.precio;

  // Si la categoria del juego esta en el select, se elige directamente.
  // Si no (por ejemplo, vino de la opcion "Otra" en su momento), se
  // selecciona "Otra" y se precarga el campo de texto libre.
  const opciones = Array.from(selectCategoria.options).map(o => o.value);
  if (opciones.includes(videojuego.categoria)) {
    selectCategoria.value = videojuego.categoria;
    labelOtraCategoria.style.display = 'none';
  } else {
    selectCategoria.value = VALOR_OTRA;
    labelOtraCategoria.style.display = 'flex';
    inputOtraCategoria.value = videojuego.categoria;
  }

  tituloFormAgregar.textContent = `Editando: ${videojuego.nombre}`;
  btnSubmitAgregar.textContent = 'Guardar cambios';
  btnCancelarEdicion.style.display = 'inline-block';

  document.getElementById('seccion-agregar').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function salirModoEdicion() {
  idEnEdicion = null;
  formAgregar.reset();
  labelOtraCategoria.style.display = 'none';
  tituloFormAgregar.textContent = 'Agregar videojuego';
  btnSubmitAgregar.textContent = 'Agregar';
  btnCancelarEdicion.style.display = 'none';
}

btnCancelarEdicion.addEventListener('click', salirModoEdicion);

// Pide confirmacion y, si el usuario acepta, elimina el videojuego.
async function eliminarVideojuego(id) {
  const videojuego = videojuegosEnMemoria.find(v => v.id === id);
  if (!videojuego) return;

  const confirmado = window.confirm(`¿Seguro que quieres eliminar "${videojuego.nombre}"? Esta accion no se puede deshacer.`);
  if (!confirmado) return;

  const respuesta = await peticionHTTP(`/api/videojuegos/${id}`, { method: 'DELETE' });

  if (respuesta.ok) {
    actualizarBitacora(pasosEliminar(videojuego.nombre));
    cargarVideojuegos();
    cargarEstadisticas();
    if (idEnEdicion === id) salirModoEdicion(); // si estabas editando el que acabas de borrar
  }
}

// ============================================================
// FORMULARIO: AGREGAR VIDEOJUEGO
// ============================================================
formAgregar.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const categoriaElegida = selectCategoria.value;
  const categoriaFinal = categoriaElegida === VALOR_OTRA
    ? inputOtraCategoria.value.trim()
    : categoriaElegida;

  const datosVideojuego = {
    nombre: document.getElementById('input-nombre').value,
    precio: document.getElementById('input-precio').value,
    categoria: categoriaFinal
  };

  const estaEditando = idEnEdicion !== null;
  const url = estaEditando ? `/api/videojuegos/${idEnEdicion}` : '/api/videojuegos';
  const metodo = estaEditando ? 'PUT' : 'POST';

  const respuesta = await peticionHTTP(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosVideojuego)
  });

  const datos = await respuesta.json();

  if (respuesta.ok) {
    mensajeAgregar.textContent = estaEditando ? 'Videojuego actualizado con exito.' : 'Videojuego agregado con exito.';

    if (estaEditando) {
      actualizarBitacora(pasosActualizar({ ...datosVideojuego, id: idEnEdicion }, true, []));
      salirModoEdicion();
    } else {
      actualizarBitacora(pasosAgregar(datosVideojuego, true, []));
      formAgregar.reset();
      labelOtraCategoria.style.display = 'none';
    }

    cargarVideojuegos();
    cargarEstadisticas();
  } else {
    mensajeAgregar.textContent = 'Errores: ' + datos.errores.join(' ');
    actualizarBitacora(
      estaEditando
        ? pasosActualizar({ ...datosVideojuego, id: idEnEdicion }, false, datos.errores)
        : pasosAgregar(datosVideojuego, false, datos.errores)
    );
  }
});

// ============================================================
// BUSQUEDA
// ============================================================
const formBuscar = document.getElementById('form-buscar');
const resultadoBusqueda = document.getElementById('resultado-busqueda');

formBuscar.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const nombre = document.getElementById('input-buscar').value;

  const respuesta = await peticionHTTP(`/api/videojuegos/buscar?nombre=${encodeURIComponent(nombre)}`);
  const datos = await respuesta.json();

  if (datos.encontrado) {
    resultadoBusqueda.textContent = `Encontrado: ${datos.encontrado.nombre} - $${datos.encontrado.precio.toLocaleString('es-CO')}`;
  } else {
    resultadoBusqueda.textContent = 'No se encontro ese videojuego.';
  }

  actualizarBitacora(pasosBuscar(nombre, datos.comparaciones || { lineal: 0, binaria: 0 }));
});

// ============================================================
// ORDENAMIENTO
// ============================================================
async function ordenarPorPrecio(orden) {
  const respuesta = await peticionHTTP(`/api/videojuegos/ordenar?orden=${orden}`);
  const videojuegos = await respuesta.json();
  renderizarVideojuegos(videojuegos);
  actualizarBitacora(pasosOrdenar(orden));
}

document.getElementById('btn-orden-asc').addEventListener('click', () => ordenarPorPrecio('asc'));
document.getElementById('btn-orden-desc').addEventListener('click', () => ordenarPorPrecio('desc'));

// ============================================================
// ESTADISTICAS
// ============================================================
async function cargarEstadisticas() {
  const respuesta = await peticionHTTP('/api/videojuegos/estadisticas');
  const stats = await respuesta.json();

  const contenedor = document.getElementById('tarjetas-stats');
  contenedor.innerHTML = `
    <div class="tarjeta-stat"><div class="etiqueta">Total</div><div class="valor">${stats.cantidad}</div></div>
    <div class="tarjeta-stat"><div class="etiqueta">Promedio</div><div class="valor">$${stats.promedio.toLocaleString('es-CO')}</div></div>
    <div class="tarjeta-stat"><div class="etiqueta">Mas caro</div><div class="valor" style="font-size:0.95rem">${stats.masCaro ? stats.masCaro.nombre : '-'}</div></div>
    <div class="tarjeta-stat"><div class="etiqueta">Mas barato</div><div class="valor" style="font-size:0.95rem">${stats.masBarato ? stats.masBarato.nombre : '-'}</div></div>
  `;

  actualizarBitacora(pasosEstadisticas(stats));
}

document.getElementById('btn-cargar-estadisticas').addEventListener('click', cargarEstadisticas);

// ============================================================
// CARGA INICIAL
// ============================================================
renderizarActores();
renderizarDescripcionActor();
cargarVideojuegos();
cargarCategorias();
cargarEstadisticas();