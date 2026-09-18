// server.js
// Punto de entrada de la aplicacion.
// Aqui nace el "Back-End": el programa que se ejecuta en el servidor
// y que va a atender las peticiones que lleguen desde el navegador (cliente).

const express = require('express');
const path = require('path');
const videojuegoRoutes = require('./routes/videojuegoRoutes');

const app = express();
const PUERTO = 3000;

// MIDDLEWARE DE REGISTRO (logging): se ejecuta ANTES que cualquier ruta,
// para cada peticion que llegue. Esto es lo que hace visible, en la
// terminal del servidor, el ciclo de peticion/respuesta HTTP en tiempo
// real: cada clic en el navegador aparece aqui como una linea nueva.
app.use((peticion, respuesta, siguiente) => {
  const hora = new Date().toLocaleTimeString('es-CO', { hour12: false });
  console.log(`[${hora}] ${peticion.method}  ${peticion.originalUrl}`);
  siguiente();
});

// Permite que Express entienda peticiones con cuerpo en formato JSON (para POST)
app.use(express.json());

// Sirve los archivos publicos (CSS, JS del navegador) sin necesidad de rutas manuales
app.use(express.static(path.join(__dirname, 'public')));

// Todas las rutas de la API viven bajo el prefijo /api
app.use('/api', videojuegoRoutes);

app.get('/', (peticion, respuesta) => {
  respuesta.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});