# Entrega de arquitectura · 1 de octubre de 2026

FRAME conserva su biblioteca visual y flujo de trabajo, con correcciones de
fiabilidad en importación, historial, guardado y exportación.

- Un contrato de estado incorpora brief, portada, locación, colección y acabado.
  Deshacer rápido usa la misma pila que deshacer/rehacer. Los módulos se suscriben
  al ciclo de renderizado en lugar de sustituir repetidamente renderAll.
- Las cajas de MediaPipe JS se convierten desde centro/tamaño. Se distinguen
  «sin rostros» y «detector no disponible». El segundo caso conserva fotos enteras,
  evita cortes y uniones panorámicas, y muestra un aviso de revisión.
- Los originales se leen por ID. El guardado confirma los originales antes de
  actualizar el modelo; ante un fallo conserva el proyecto previamente guardado.
  La limpieza usa un cursor de claves y nuevo proyecto elimina los originales.
  El usuario recibe un aviso persistente si el trabajo actual no pudo guardarse.
- Los PNG respetan el orden de todas las capas y aplican el mismo acabado a fondo,
  foto, papel y texto. Si compartir falla, conservan los archivos listos y ofrecen
  una descarga explícita. Cancelar compartir respeta la decisión del usuario.
- Activar GPS después de importar vuelve a leer los originales; las coordenadas
  no se envían a servicios externos. Fotos y textos editables admiten teclado.
- Playwright queda fijado en el lockfile. El build puede comprobarse sin modificar
  archivos; la publicación prepara solo los recursos actuales y depende de las
  pruebas. Requiere activar GitHub Actions en Pages y exigir verify para main.

## Validación incluida

Pruebas internas de estado, formatos de caja, encuadres conservadores en todas las
colecciones, almacenamiento legado, limpieza, GPS tardío y entrega. Pruebas de
navegador para cuotas, recuperación y cancelación, historial, teclado, comparación
de colores entre preview/PNG en cinco acabados y orden de capas. La aceptación
existente sigue cubriendo fotos reales, 12 MP, ZIP, recortes, bibliotecas y reanudar.
La detección se simula únicamente en las regresiones de contrato/fallo y en las
pruebas aisladas de máscaras. El workflow ejecuta Chromium y WebKit; revisar su
resultado para el commit exacto antes de fusionar.

## Siguiente iteración sugerida

Las mejoras de esta tabla quedaron implementadas en la continuación de la entrega:
copia `.frame` con originales, reintento de guardado, tres direcciones narrativas,
comparación reversible y controles agrupados. El estado Guardado/Sin guardar queda
visible en el editor. Se verifican restauración exacta de bytes y conservación del
álbum al explorar o cerrar propuestas. Continúa pendiente una revisión con lector
de pantalla y pruebas de compartir y memoria en iPhone físico.

| Enfoque | Propuesta | Cómo comprobarla |
|---|---|---|
| Funcionalidad | Copia recuperable del proyecto y reintento de guardar | Recuperar fotos y ajustes tras recargar sin volver a importar |
| Creatividad | Dirección del álbum: apertura, ritmo, pausa y cierre | Comparar 3 propuestas que cambien la secuencia, no solo las posiciones |
| UX | Comparación A/B con conservar opción y explicación breve | Elegir una propuesta y volver a la anterior sin perder ajustes |
| UX y accesibilidad | Señal visible «Guardado» y revisión de contraste/foco | Probar teclado, lector de pantalla y fallos de almacenamiento |

Permanece pendiente validar compartir y presión de memoria en iPhone físico.
La siguiente refactorización puede extraer renderizadores del núcleo global; no
es necesario reescribir el producto completo para aprovechar estas correcciones.
