# dstudio-generator

Text Effect Studio v2 — editor estático para generar efectos de texto de Minecraft (`newResources`).

## GitHub Pages

Sitio publicado: <https://danshi17.github.io/dstudio-generator/>

El despliegue es automático en cada push a `main` mediante GitHub Actions
(`.github/workflows/pages.yml`). No requiere compilación: se publican
`index.html`, `app.js` y `style.css` tal cual.

### Configuración inicial (una sola vez)

En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Uso local

Abre `index.html` en el navegador o sirve la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8000
```

Luego visita <http://localhost:8000>.
