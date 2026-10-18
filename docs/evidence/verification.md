# Verificación del primer hito

Fecha: 2026-10-18. Base del repositorio: `87edc6c`. Rama local: `feat/fiel-vector-review`. Worktree: `/workspace/mapas-gps/.worktrees/vector-review`.

## Qué se ejecutó

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 9 pruebas: fuente/hash y dimensiones, esquema/IDs/coordenadas, separación de geografía, huecos, transformaciones, tolerancia de simplificación y SHA-256 portátil |
| `npm run test:browser` | 12 comprobaciones en Chromium 154.0.8037.57: carga, modos, opacidades, capas, selección por ratón/teclado/tap, anclaje de zoom, arrastre, tamaño, descarga, errores, tacto y conservación de datos |
| `npm run build:standalone` y `npm run test:standalone` | HTML con foto/datos/evidencia incrustados; una solicitud inicial al HTML, luego controles en modo offline, sin recursos externos |
| `python scripts/trace-trails.py --pdf /workspace/scratch/geo/official-map.pdf` | 9 fragmentos / 245 vértices / 7 zonas pendientes; PDF y foto verificados por SHA-256 |
| `curl -I http://127.0.0.1:4173/revision.html` | HTTP 200 en el entorno de ejecución |
| Comparación con base de los 9 archivos legacy indicados por el usuario | Sin cambios; original JPG idéntico |

El resultado detallado del navegador está en [browser-results.json](browser-results.json); contiene versión exacta, tamaños y nombres de las comprobaciones.

### Datos y geometría

- JSON real cargado y cotejado con los bytes originales de la foto.
- Coordenadas finitas dentro de 900 × 1100, IDs únicos y pertenencia al sendero; rechazo de CRS geográfico, puntos fuera de imagen y huecos con geometría inventada.
- Zoom conserva el punto bajo el cursor; pan es reversible. Se comparan matrices foto/vector tras zoom, arrastre y resize, incluido letterboxing.
- Todas las muestras densas de cada fragmento permanecen a ≤1,008 px de la polilínea simplificada (1 px de tolerancia más redondeo). Es verificación de simplificación, no exactitud de terreno.
- Se mantienen nodos visuales separados; conexiones y correspondencias geográficas vacías.

### Navegador y móvil

Escritorio 1440 × 1100; resize a 1000 × 900; móvil emulado 390 × 844, escala de dispositivo 2 y entrada táctil. El pellizco se genera como dos contactos reales mediante el protocolo de Chromium. Se prueban arrastre, cancelación, selección tocando una polilínea y ausencia de scroll horizontal.

Se verifican errores con JSON inválido, foto ausente y foto cuyos bytes cambiaron. Se fuerza ausencia de `crypto.subtle`, equivalente al problema de HTTP por IP en muchos teléfonos, y se comprueba el hash mediante la alternativa local.

La prueba de regresión almacena un mapa **sintético** en IndexedDB (`mapas-gps-v1/maps`) con blob, calibración y datos GIS; abre el visor y confirma que todos siguen idénticos. También conserva `sample-installed` y una clave de prueba de localStorage. El visor no tiene instrucciones de escritura en esos almacenes. Se abre el mapa original desde la aplicación anterior como prueba de humo.

### Revisión visual

Se inspeccionaron realmente el original, la versión oficial y las capturas ampliadas de los tres senderos. La comparación usa exactamente el mismo encuadre en foto, superposición y solo vectores. Se confirmó que el ramal Cactus queda excluido, que La Virgen continúa al oeste y que los recuadros no se sustituyen por conexiones.

- [Starwars: foto / superposición / vectores](screenshots/starwars-comparacion.png)
- [La Virgen: foto / superposición / vectores](screenshots/la-virgen-comparacion.png)
- [Lomo Vetado: foto / superposición / vectores](screenshots/lomo-vetado-comparacion.png)
- [Escritorio](screenshots/desktop-overlay.png)
- [Móvil](screenshots/mobile-overlay.png)
- [Móvil, solo vectores](screenshots/mobile-vectors.png)

Una revisión independiente inspeccionó fuente, código y capturas; comprobó además clic sobre línea, arrastre desde línea sin selección accidental, matrices compartidas y que ninguna arista atraviesa los interiores de las zonas pendientes (margen 3 px). Confirmó los tres hashes de fuentes y la ausencia de cambios legacy.

Encontró un fallo importante: la comprobación de SHA se omitía sin `crypto.subtle`. Se corrigió con SHA-256 local probado con vectores conocidos, bloques límite, un millón de caracteres y la foto real. La prueba de regresión se ejecutó con la omisión temporalmente reproducida y falló porque aceptaba un JPEG válido con bytes cambiados; con la corrección pasa. No queda ese fallo abierto. La observación menor sobre un enlace a este documento también queda resuelta al crearlo.

## Límites de las comprobaciones

- No se probó en un teléfono físico ni en Safari/iOS.
- La política administrativa del Chromium de este entorno bloquea navegar a `file://` (`ERR_BLOCKED_BY_ADMINISTRATOR`). No se eludió. Se comprobó el **mismo HTML autónomo por HTTP**, después offline y sin recursos externos; la apertura directa de archivo en el navegador del usuario no se afirma como comprobada aquí.
- La URL `http://127.0.0.1:4173/revision.html` es un servidor local del entorno. No es una vista previa pública ni un enlace a GitHub Pages; no hay reenvío de puertos disponible en las herramientas de esta sesión.
- No hubo publicación ni push; main permanece en la base. El HTML autónomo y el ZIP son la entrega portable. El servidor se usa para QA y puede iniciarse de nuevo con el comando indicado.
- La homografía entre imágenes tiene una comprobación interna con selección compartida de inliers; no es una prueba independiente de exactitud. Ver [método](primer-hito.md).
- No se validaron posiciones GPS, sentidos de circulación, accesos actuales ni conexiones transitables. Hay 10 referencias OSM registradas pero cero pares píxel/geografía aceptados y ninguna transformación geográfica.

## Continuar sin reconstruir contexto

Revisar las tres comparaciones y las siete zonas del JSON, conservar los IDs al corregir vértices y resolver ambigüedades con evidencia de la misma edición. Después establecer controles geográficos inequívocos y puntos independientes para evaluar el ajuste. No convertir longitudes del cartel en metros ni usar las viejas geometrías ilustrativas como atajo.

## Actualización tras recibir `81184.jpg`

Se volvió a ejecutar la suite: **11 pruebas unitarias/de datos**, las **12 comprobaciones de navegador**, una comprobación adicional de fuentes en móvil (`npm run test:sources`) y el HTML autónomo con las dos imágenes y la foto completa privada. Todas pasaron. Se probó la recuperación al fallar una imagen: conserva la anterior ya verificada. Cambiar de fuente mantiene los puntos de las polilíneas y el viewBox, y la imagen y los vectores siguen compartiendo la misma matriz.

El nuevo fondo tiene 1800 × 2200 píxeles y se muestra en el mismo plano 900 × 1100. La foto nueva completa (960 × 1280) se puede abrir en un diálogo de la copia privada; su SHA coincide con el adjunto. No se incorpora a los archivos públicos ni se convierte en un control geográfico. Véase [new-photo-81184.md](new-photo-81184.md).
