# Leonida Atlas — GTA VI Fan Map

Proyecto fan-made, no oficial y no afiliado a Rockstar Games ni Take-Two Interactive.

## Añadir el mapa oficial
1. Descarga el mapa/poster de Leonida desde una publicación oficial de Rockstar Games.
2. Guarda la imagen como `assets/official-map.jpg`.
3. Recarga `index.html`.

No se incluye una imagen sustitutiva ni una geografía reconstruida: la capa cartográfica queda vacía hasta que se añada el archivo oficial.

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
Sube todos los archivos al repositorio. En GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
