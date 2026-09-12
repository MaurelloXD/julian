# 🎮 Tienda de Videojuegos MVC

Proyecto educativo para el programa de **Análisis y Desarrollo de Software (SENA)**,
que integra los conceptos de las guías **"Fundamentos del Back-End y Lenguajes de
Programación Web"** y **"Arquitectura de Software y Patrones de Diseño"**.

Este repositorio existe para **enseñar**, no solo para funcionar. Cada commit
representa una etapa del desarrollo, pensada para explicarse en clase paso a paso.
Revisa el historial (`git log`) para ver la evolución completa del proyecto.

## Descripción

Una tienda de videojuegos donde se puede consultar, agregar, buscar, ordenar y
obtener estadísticas de un catálogo, construida sin frameworks de Front-End y sin
base de datos (los datos persisten en un archivo JSON).

## Tecnologías

```
HTML5, CSS3, JavaScript (Front-End)
Node.js + Express (Back-End)
Git y GitHub (control de versiones)
```

## Arquitectura: MVC

```
Model       -> models/videojuegoModel.js         (reglas de negocio y algoritmos)
View        -> views/index.html + public/        (interfaz visual)
Controller  -> controllers/videojuegoController.js (coordina peticiones)
```

Además:
- `validators/videojuegoValidator.js` — validación de datos (Principio SOLID: SRP).
- `repositories/videojuegoRepository.js` — acceso a los datos (Patrón Repository).

Flujo de una petición:

```
Usuario -> View -> Petición HTTP -> Controller -> Model -> Repository -> Datos
                                                                            |
Usuario <- View <- Respuesta    <- Controller <---------------------------┘
```

## Estructura del proyecto

```
tienda-videojuegos-mvc/
├── controllers/
│   └── videojuegoController.js
├── models/
│   └── videojuegoModel.js
├── validators/
│   └── videojuegoValidator.js
├── repositories/
│   └── videojuegoRepository.js
├── views/
│   └── index.html
├── routes/
│   └── videojuegoRoutes.js
├── public/
│   ├── css/styles.css
│   └── js/app.js
├── data/
│   └── videojuegos.json
├── server.js
├── package.json
└── README.md
```

## Instalación

```bash
npm install
```

## Uso

```bash
node server.js
```

Luego abre `http://localhost:3000` en el navegador.

## Funcionalidades

- **Consultar** el catálogo completo (`GET /api/videojuegos`).
- **Agregar** un videojuego con validación de nombre, precio y categoría
  (`POST /api/videojuegos`).
- **Buscar** por nombre, comparando búsqueda lineal vs. binaria
  (`GET /api/videojuegos/buscar?nombre=...`).
- **Ordenar** por precio, ascendente o descendente, con burbuja manual
  (`GET /api/videojuegos/ordenar?orden=asc|desc`).
- **Estadísticas**: cantidad, promedio, más caro y más barato
  (`GET /api/videojuegos/estadisticas`).

Los datos se guardan en `data/videojuegos.json`: los cambios persisten aunque se
reinicie el servidor.

## Conceptos aprendidos

- Cliente / servidor, HTTP, JSON.
- Algoritmos: validación, búsqueda lineal y binaria, ordenamiento burbuja,
  procesamiento y agregación de datos.
- Arquitectura MVC.
- Principio SOLID de Responsabilidad Única (SRP), con refactorización real
  antes/después (ver commit "Aplicar principio SOLID").
- Patrón de diseño Repository.
- Git y GitHub como herramienta de documentación del proceso, no solo de
  almacenamiento de código.

## Cómo navegar el historial de aprendizaje

```bash
git log --oneline
```

Cada commit puede revisarse individualmente:

```bash
git show <hash-del-commit>
```

Esto permite ver exactamente qué cambió y por qué, tal como se explicó en clase.
