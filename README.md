# Leonida Atlas — GTA VI Fan Map

Proyecto fan-made, no oficial y no afiliado a Rockstar Games ni Take-Two Interactive.

## Mapa oficial
El sitio carga el mapa desde `assets/official-map.jpg.jpg`, que es el nombre del archivo actualmente guardado en el repositorio. Si cambias el nombre, actualiza también la ruta del elemento `img#officialMap` en `index.html`.

## Añadir descubrimientos
Edita el array `discoveries` al principio de `app.js`. Cada elemento usa coordenadas porcentuales sobre la imagen:
```js
{
  id: "id-unico",
  title: "Nombre",
  area: "Zona",
  category: "mystery",
  status: "confirmed", // confirmed | official | theory
  description: "Descripción basada en evidencia.",
  source: "https://fuente-verificable.example",
  x: 42.5, // porcentaje horizontal
  y: 31.2  // porcentaje vertical
}
```
Categorías: `mystery`, `ufo`, `references`, `locations`, `collectibles`, `wildlife`, `activities`.
No añadas teorías como hechos; usa `status: "theory"` y una fuente.

## Publicar gratis con GitHub Pages
En GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save. La web estará disponible cuando termine la primera publicación.
