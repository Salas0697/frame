# FRAME

Estudio de carruseles fotográficos que funciona en el navegador: importar fotos,
elegir una colección, ajustar el encuadre y exportar PNG o ZIP. Las imágenes y los
originales guardados permanecen en el dispositivo. No necesita un backend.

## Desarrollo

Requiere Node.js 24, npm y Python 3 para el servidor de pruebas.

```sh
npm ci
npm run build
python3 -m http.server 4173 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4173/`. La entrada alternativa `/frame/` usa el mismo
runtime. Editar las fuentes de `frame/`, no el JavaScript generado de `assets/runtime/`.

```sh
npm test
npx playwright install --with-deps chromium webkit
npm run test:e2e
npm run check:build
npm run package:site
```

Las pruebas de navegador usan fotos reales de Picsum, originales de 12 MP y
fixtures deterministas para GPS, colores, cuotas y errores de entrega. Las fotos
de prueba se descargan bajo `.qa/photos/` y se reutilizan; un fallo de descarga
hace fallar la prueba. Capturas, trazas e informe HTML quedan en `test-results/`
y `playwright-report/`.

## Arquitectura vigente

| Responsabilidad | Fuente |
|---|---|
| Estado e historial compartido | `frame/project-state.js` |
| Eventos de renderizado y guardado | `frame/lifecycle.js` |
| Importación y original persistido | `frame/photo-import-controller.js`, `frame/photo-store.js` |
| Composición y catálogo | `frame/template-engine.js`, `frame/template-catalog.json` |
| Análisis de rostro y adaptación de coordenadas | `frame/photo-analysis.js`, `frame/face-geometry.js` |
| Acabados y recuperación de entrega | `frame/finish.js`, `frame/export-delivery.js` |
| EXIF y nota de locación | `frame/photo-location.js` |
| Editor y renderizadores | `frame/director/base.html`, módulos de interacción |
| Runtime y entradas generadas | `tools/build.mjs` |

El núcleo conserva estado global y algunos adaptadores heredados; esta corrección
unifica el historial y elimina las reasignaciones de `renderAll` del runtime activo.
`director-enhancements.js` y otras versiones históricas quedan como referencia,
fuera del ensamblado vigente. El artefacto de publicación contiene únicamente
las dos entradas, el runtime actual, el catálogo de localidades y los iconos.

## Publicación y configuración requerida

El workflow `FRAME quality` comprueba el build comprometido, ejecuta pruebas
internas y Chromium/WebKit, y prepara el artefacto. En `main`, `deploy` depende de
`verify`: una prueba fallida impide publicar por este workflow.

Para que esa garantía sustituya la publicación antigua por rama, el administrador
debe seleccionar **Settings → Pages → Source → GitHub Actions**. Además, configurar
una regla para `main` que exija PR y el check `verify`. Estos ajustes administrativos
no se activan al cambiar el YAML. No fusionar la migración sin revisar ambos.

La detección de rostros carga MediaPipe con versión fijada desde jsDelivr. Si no
está disponible, se conserva la foto completa y se pide revisar los encuadres.
WebKit automatizado no sustituye una comprobación de compartir y memoria en un
iPhone físico. Consultar [la entrega de arquitectura](docs/architecture-reliability.md).

Datos de localidades: GeoNames / cities.json, CC BY 4.0; licencias en `docs/licenses/`.
