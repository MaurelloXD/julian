# Notas para la presentación en clase

## Tags disponibles para saltar en vivo entre etapas

Usa `git checkout <tag>` para mostrar el proyecto en un punto específico
sin desplazarte por el log en vivo. Vuelve a la última versión con
`git checkout main`.

| Tag | Qué muestra |
|---|---|
| `etapa-1-proyecto-inicial` | Solo package.json y estructura vacía |
| `etapa-2-servidor` | Servidor Express respondiendo |
| `etapa-3-mvc-conectado` | Model + View + Controller + Rutas funcionando juntos |
| `etapa-4-algoritmos` | Búsqueda, ordenamiento, validación y estadísticas completas |
| `etapa-5-solid-refactor` | El "antes" queda en el commit anterior; aquí ya está refactorizado |
| `etapa-6-final` | Proyecto completo con Repository, CSS y README |

## Ejemplo de uso en vivo

```bash
git log --oneline                 # mostrar toda la historia
git show <hash>                   # mostrar el diff exacto de un commit
git checkout etapa-5-solid-refactor
git diff HEAD~1 HEAD -- controllers/videojuegoController.js
```

## Reto para los aprendices (cierre de la sesión)

Agregar un filtro por categoría: `GET /api/videojuegos/categoria/:nombre`.

Preguntarles antes de escribir código:
- ¿Qué archivo del Model necesitan tocar?
- ¿Necesitan una ruta nueva? ¿Dónde va?
- ¿El Controller necesita alguna función nueva?
- ¿La View necesita algo nuevo (un filtro, un selector)?

El objetivo no es que escriban mucho código, sino que ubiquen correctamente
en qué capa de MVC va cada cambio.
