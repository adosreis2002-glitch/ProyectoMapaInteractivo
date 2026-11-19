# Leonida Atlas — mapa interactivo fan-made de GTA VI

Proyecto comunitario no oficial, sin afiliación con Rockstar Games ni Take-Two Interactive.

## Mapa
La página carga el archivo que está actualmente en el repositorio: `assets/official-map.jpg.jpg`. Para cambiarlo, actualiza la ruta de `img#officialMap` en `index.html`.

La imagen se ajusta a su proporción original. Puedes arrastrar para desplazarte, acercar o alejar con la rueda del ratón o con los botones, usar `+` / `-` y pulsar `0` para restablecer la vista.

## Marcadores
El array `discoveries` al principio de `app.js` está vacío intencionadamente para no inventar ubicaciones. Añade solo hallazgos con fuente verificable, usando coordenadas porcentuales (0–100) relativas a la imagen:

```js
{
  id: "id-unico",
  title: "Nombre",
  area: "Zona",
  category: "mystery",
  status: "confirmed", // confirmed | official | theory
  description: "Descripción basada en evidencia.",
  source: "https://fuente-verificable.example",
  x: 42.5,
  y: 31.2
}
```

Categorías: `mystery`, `ufo`, `references`, `locations`, `collectibles`, `wildlife`, `activities`. El progreso de descubrimientos se guarda localmente en el navegador.

## Publicación
GitHub Pages debe apuntar a la rama `main` y a la carpeta `/ (root)`. Una vez publicado, la página estará en `https://adosreis2002-glitch.github.io/ProyectoMapaInteractivo/`.
