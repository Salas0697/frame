# FRAME: biblioteca editorial para el randomizador

Investigación: 14 de septiembre de 2026. Estado: propuesta de diseño y catálogo de datos; todavía no integrado en el motor ni publicado. Código de referencia: main `dc04e1ef7b8d86cc2bda734d7a028dce305e8ff4`.

## Dirección recomendada

Priorizar una colección de páginas de álbum fotográfico: cuadrículas precisas, márgenes generosos, dípticos y notas discretas. La captura aportada por el usuario es el referente principal de gusto. Las aplicaciones sirven para identificar familias recurrentes; no para sustituir esa preferencia.

La investigación revisa catálogos y descripciones públicas oficiales. No incluye estadísticas privadas de uso por plantilla ni pruebas de las apps. Por tanto, «popular» describe la adopción de los referentes y la recurrencia de estilos; no un ranking probado de plantillas individuales.

## Referentes y evidencia

| Referente | Evidencia pública consultada | Qué aporta a FRAME |
| --- | --- | --- |
| SCRL | La ficha estadounidense mostraba 121 mil valoraciones y 4,8/5. Describe cuadrículas, composiciones libres y carruseles panorámicos continuos. | Proporciones, separación entre fotos y continuidad entre páginas. [Fuente oficial](https://apps.apple.com/us/app/scrl-photo-collage-maker/id1289057196). |
| Unfold | Google Play mostraba más de 10 millones de descargas. Describe más de 400 plantillas y colecciones como Film, con fondos y tipografía personalizables. | Familias consistentes de álbum y película, con variaciones dentro de cada colección. [Fuente oficial](https://play.google.com/store/apps/details?hl=en_US&id=com.moonlab.unfold). |
| Tezza | La ficha estadounidense mostraba 47 mil valoraciones y 4,7/5. Enumera más de 150 diseños de película, editorial, revista, moodboard y minimalismo, entre otros. | Lenguaje de revista, marcos analógicos y textura opcional. [Fuente oficial](https://apps.apple.com/us/app/tezza-aesthetic-photo-editor/id1393061654). |
| Canva | Su catálogo público incluye collages minimalistas, diarios de viaje, moodboards, scrapbook y marcos de fotografía instantánea. | Confirma la recurrencia de esas familias y ofrece ejemplos consultables. No establece popularidad relativa. [Catálogo oficial](https://www.canva.com/photo-collages/templates/). |

Las métricas pertenecen a tiendas y territorios diferentes: no permiten comparar cuota de mercado. Se registran como señales de adopción, no como pesos del randomizador.

## Lectura de la captura

Se observan nueve fotografías verticales en una retícula 3×3 dentro de una sola página del carrusel, marcada 3/9. No es una cuadrícula repartida por el perfil de Instagram. No se puede identificar con certeza la aplicación de origen.

El margen lateral ocupa aproximadamente el 8% del ancho de la página y las separaciones interiores son mucho menores. Hay fondo blanco, esquinas rectas y una nota monoespaciada pequeña, alineada a la izquierda debajo de las imágenes. Las fotografías conservan sus colores: el marco común organiza museo, retrato y calle sin decoraciones superpuestas.

Lo que hace funcionar esta referencia es la combinación de alta densidad interior y espacio exterior. «Con aire» no debe significar obligatoriamente una sola fotografía. La captura parece próxima a 3:4; FRAME trabaja actualmente en 4:5. Los valores del catálogo son adaptaciones propuestas para 4:5, no mediciones exactas del original.

## Colección propuesta: ocho familias, dieciocho variantes

Los nombres son propios de esta propuesta, no nombres de productos de las apps.

| Prioridad | Familia | Variantes | Cuándo funciona | Precaución de composición |
| --- | --- | --- | --- | --- |
| 1 | Museum Notes | 9, 6 o 4 fotos en cuadrícula | Viajes, arte, arquitectura, detalles; referencia del usuario | Los grupos de personas y detalles diminutos necesitan celdas mayores. |
| 1 | Gallery Book | Foto centrada o desplazada | Retratos, imagen de apertura o cierre, escenas que necesitan respirar | Mantener sujetos completos; no llenar el margen con adornos. |
| 1 | Editorial Pair | Díptico vertical, dos horizontales o tríptico | Contraste entre retrato y entorno, pequeñas secuencias | Elegir la orientación a partir del recorte disponible. |
| 2 | Film Archive | Tira de 3 o contacto de 6 | Recuerdos, escenas sucesivas, intención nostálgica | Marcos discretos; textura y grano desactivados por defecto. |
| 2 | Travel Journal | Protagonista con 2 o 3 detalles | «Contar una historia» | Texto opcional del usuario; no inventar ciudad, fecha o vivencias. |
| 2 | Continuous | Una imagen a través de 2 o 3 páginas | Panorámicas y transiciones | Evaluar rostros respecto a cada corte, no solo al lienzo completo. |
| 3 | Soft Scrapbook | 3 o 4 imágenes superpuestas | Recuerdos informales y opción atrevida | Rotación limitada y ninguna cara tapada. |
| 3 | Color Editorial | Una protagonista o díptico con acento | «Color» o «Impactar» | Un color tomado de las fotos; no un color nuevo por página. |

Primera entrega recomendada: las tres familias de prioridad 1, con ocho variantes. Son las más próximas a la preferencia demostrada. Las demás amplían diversidad sin hacer que todos los resultados parezcan collages recargados.

## Cómo alimentar el randomizador

El archivo `template-catalog.proposed.json` contiene las dieciocho variantes, geometría normalizada, fuentes, cantidad de fotos y preferencias de brief. Es un contrato propuesto para integración; el runtime actual no lo carga.

1. Elegir una familia compatible con el brief y el conjunto de fotos. Los pesos iniciales expresan dirección de producto, no supuesta popularidad medida.
2. Filtrar variantes por cantidad de fotos disponibles, proporción y recorte seguro. Nunca rellenar una cuadrícula duplicando fotos sin una decisión explícita del usuario.
3. Construir una secuencia coherente. Por ejemplo, con doce fotos: una apertura, un díptico y una página de nueve. Las doce fotos aparecen una vez; la composición densa es una parte del relato.
4. Mantener fondo, márgenes y tipografía dentro de la misma familia. Variar ocupación, orden, imagen protagonista y orientación.
5. Separar el espacio exterior de la densidad interior. Permitir una cuadrícula de nueve con mucho margen si la legibilidad de las fotos lo admite.
6. Evaluar cobertura de todas las fotos, recorte de sujetos, legibilidad, ritmo y distancia respecto al diseño anterior. La seguridad del recorte precede al atractivo de una plantilla.
7. En «Otra opción», reutilizar las fotos y análisis existentes, conservar el brief y buscar otra secuencia válida. No forzar siempre un cambio radical de estilo.

La encuesta y el controlador de importación permanecen como entrada del proceso: esta biblioteca se consulta después de responder y analizar, nunca desde un nuevo listener del selector.

## Limitaciones comprobadas en el código actual

Inspección de `frame/storyboard-v1.js`:

- `HINTS.contact` tiene cuatro celdas; no existen variantes de seis o nueve.
- `makeCandidate()` limita `desired` a cuatro fotos. Añadir datos al catálogo por sí solo no habilita nueve.
- `candidateScore()` penaliza cada celda con área inferior al 8% del lienzo. Una cuadrícula con márgenes amplios puede disparar nueve penalizaciones aunque sea intencional.
- Las páginas con tres o más fotos se consideran densas y reciben penalizaciones adicionales según cantidad y brief. Hace falta distinguir una retícula ordenada de un collage saturado.
- `chooseDirection()` reduce mucho el peso de la dirección anterior, y la puntuación también penaliza repetirla. Conviene permitir otra buena composición dentro de Museum Notes cuando el usuario quiere ese estilo.
- El filtrado final de capas conserva imágenes o texto marcado `userTouched`; una nota automática de plantilla necesita un tratamiento explícito para sobrevivir. El contenido debe proceder del usuario o de metadatos confirmados.

Estas son observaciones estáticas del motor. Esta investigación no declara pruebas visuales ni aceptación end-to-end de las nuevas plantillas.

## Criterios de integración

- Probar lotes de 1, 2, 3, 4, 6, 8, 9 y 12 fotos, incluyendo mezcla de orientaciones y grupos de personas.
- Poder producir la secuencia 1 + 2 + 9 con doce fotos únicas; evitar omisiones, repeticiones involuntarias y celdas vacías.
- Comparar Museum Notes con la referencia: margen blanco, retícula regular, separaciones finas y pie opcional.
- Verificar la legibilidad a tamaño móvil y en exportación. No dar por bueno un recorte solo por su puntuación numérica.
- «Otra opción» conserva el conjunto de fotos, el brief y los análisis. La adición de fotos conserva el flujo obligatorio selector → encuesta → análisis.
- Validar importación, generación y exportación en navegador, incluyendo Safari/PWA cuando esté disponible. Esta propuesta no sustituye las pruebas pendientes del flujo de carga.
