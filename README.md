# Leonida Atlas

Mapa interactivo fan-made de GTA VI con identidad visual propia.

## Controles
- Arrastra el mapa con el ratón o el dedo.
- Usa la rueda del ratón para zoom centrado en el cursor.
- Haz doble clic para acercar o restablecer.
- Usa `+`, `-` y `0` desde el teclado.
- Pulsa el botón central para volver a la vista inicial.

## Marcadores
Añade elementos al array `discoveries` en `app.js`:

```js
{
  id: 'ejemplo', title: 'Título', area: 'Zona',
  category: 'locations', status: 'official',
  description: 'Descripción', source: 'https://example.com',
  x: 50, y: 50
}
```

Las coordenadas son porcentajes sobre la imagen cargada desde `assets/official-map.jpg.jpg`.
