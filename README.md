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

## Biblioteca y diversidad

26 colecciones originales, 116 variantes y 60 portadas. Buscar por nombre o estilo
en la biblioteca. Nuevas miradas: Bauhaus, Margen, Archivo Apilado, Neón,
Blueprint, Lino, Correspondencia y Cinta. Las cuatro familias de cortes tienen
portadas propias; Museum Notes conserva la retícula de referencia de nueve fotos.

La comparación usa rectángulos finales después de ajustar las fotos, sin IDs ni
orden de imágenes. Penaliza composiciones recientes y repetidas dentro del álbum;
si hace falta, cambia escala y posición con una transformación uniforme que
conserva el recorte. El historial guarda hasta 32 geometrías recientes. Las
panorámicas continuas y las páginas fijadas conservan su relación intencional.

«De la colección» usa el fondo de cada identidad. «Desde tus fotos» sigue usando
colores medidos; blanco, negro y color elegido conservan la elección explícita.
El arte gráfico se genera como capas nativas: selección, editor, miniaturas,
comparación, copia .frame y PNG utilizan la misma composición. No se inventan
leyendas, fechas ni lugares. La prueba de diversidad genera una lámina con los
PNG reales de las 26 colecciones y comprueba cobertura y geometría.
Las vistas previas del selector tienen como máximo 640 px en su lado mayor y
liberan imágenes y URLs al cerrar; los originales se conservan para la exportación.

## Arquitectura vigente

| Responsabilidad | Fuente |
|---|---|
| Estado e historial compartido | `frame/project-state.js` |
| Eventos de renderizado y guardado | `frame/lifecycle.js` |
| Importación y original persistido | `frame/photo-import-controller.js`, `frame/photo-store.js` |
| Composición y catálogo | `frame/template-engine.js`, `frame/template-style.js`, `frame/template-catalog.json` |
| Análisis de rostro y adaptación de coordenadas | `frame/photo-analysis.js`, `frame/face-geometry.js` |
| Acabados y recuperación de entrega | `frame/finish.js`, `frame/export-delivery.js` |
| EXIF y nota de locación | `frame/photo-location.js` |
| Copia portátil con originales | `frame/project-file.js` |
| Ritmo, Calma y Contraste | `frame/narrative.js` |
| Comparación y controles de proyecto | `frame/album-workspace.js` |
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

Para que esa garantía sustituya completamente la publicación antigua por rama, el administrador
debe seleccionar **Settings → Pages → Source → GitHub Actions**. Además, configurar
una regla para `main` que exija PR y el check `verify`. Estos ajustes administrativos
no se activan al cambiar el YAML. Mientras Pages siga usando una rama, también
puede publicar por su workflow automático; comprobar el PR antes de fusionar.

## Continuar y comparar un álbum

**Comparar** conserva el álbum actual como opción A y prepara Ritmo, Calma y
Contraste. Explorar o cerrar no modifica el proyecto; **Usar esta opción** aplica
la propuesta como una transacción que se puede deshacer. Las páginas fijadas y
las uniones panorámicas conservan su posición. En **Ajustes y proyecto** se puede
cambiar la dirección narrativa, personalizar el acabado y guardar una copia.

Una copia `.frame` contiene los originales y los ajustes, con un límite de 250 MB.
Se puede abrir desde la pantalla inicial o el editor. Al restaurarla, se asignan
nuevos IDs antes de guardar: un fallo no sobrescribe los originales del proyecto
anterior. No depende de un servicio externo. El aviso **Sin guardar** ofrece
reintentar la persistencia o descargar una copia del trabajo actual.

La detección de rostros carga MediaPipe con versión fijada desde jsDelivr. Si no
está disponible, se conserva la foto completa y se pide revisar los encuadres.
WebKit automatizado no sustituye una comprobación de compartir y memoria en un
iPhone físico. Consultar [la entrega de arquitectura](docs/architecture-reliability.md).

Datos de localidades: GeoNames / cities.json, CC BY 4.0; licencias en `docs/licenses/`.
