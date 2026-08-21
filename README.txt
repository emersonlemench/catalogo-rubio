# Rubio Coffee Roasters — web

## Estructura

- `index.html`: estructura general.
- `css/styles.css`: diseño responsive.
- `js/app.js`: carga JSON y genera fichas/radar.
- `data/coffees.json`: lista de cafés.
- `data/*.json`: información individual de cada café.
- `data/about.json`: About Us.
- `data/catire.json`: Catire.
- `data/products.json`: cafés por bolsita.
- `data/contact.json`: contacto.
- `images/`: imágenes.

## Para agregar un café

1. Copiá un JSON de `data/`.
2. Cambiá sus datos.
3. Agregá el nombre del archivo a `data/coffees.json`.
4. Colocá la foto indicada en `images/`.

El radar usa solamente las puntuaciones existentes en `sensory`. Si un café no tiene una métrica, esa métrica se omite automáticamente.

## Importante

Como la página usa `fetch()` para cargar JSON, conviene probarla mediante un servidor local o directamente en el hosting. Abrir `index.html` con doble clic puede bloquear la carga de los JSON en algunos navegadores.
