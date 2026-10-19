# Parques y senderos · entrega móvil

Fecha: 18-10-2026, America/Santiago. Rama `feat/mapa-geografico`. No cambia `main` ni la publicación de GitHub Pages.

## Implementado

Entrada por `mapa-geografico.html`: selección de parque → información y servicios → tarjetas iguales de mapa y senderos → fichas desplegables → mapa a pantalla completa con información inferior. El mapa mantiene una instancia Leaflet; no contiene iframes. Las líneas son capas geográficas nativas, seleccionables y ocultables, con halo y colores estables.

Tarjetas cerradas: 176 px de alto y ancho completo en móvil; mismo tamaño entre mapa y senderos. La información desplegada crece fuera de esa cabecera. Controles táctiles principales de al menos 44 px. Atrás y Escape cierran el mapa. En escritorio se muestran dos columnas.

## Datos y límites

- **Lomo Vetado**: OSM 477170097 v6, 127 nodos, unos 2,79 km calculados sobre la línea. Secuencia completa y tres anclas fijas comprobadas.
- **Subida Buitrera**: OSM 477168992 v11, 145 nodos, edición 29-05-2024, unos 4,67 km de la vía completa. Se conserva su nombre; no se equipara a todas las subidas del parque ni se afirma que toda esa vía esté dentro del recinto actual.
- **La Virgen y Starwars**: fichas y dificultades del operador; no hay aquí polilíneas reutilizables acreditadas para dibujar. Seleccionarlas conserva el mapa y muestra «Trazado pendiente». Las referencias externas no sustituyen sus capas.
- Baños, agua potable, cafetería, tienda, guardaparques y pumptrack: [página oficial Outlife](https://www.outlife.cl/parques/rkf-el-durazno/), iconos activos comprobados. Estacionamiento está inactivo y no se anuncia; «Taller MTB» no se interpreta como taller mecánico. La posición exacta de estos servicios no está documentada y no se inventan marcadores.
- Sin mediciones de desnivel propias de las líneas OSM ni registros personales de velocidad: «Sin datos» / «Sin registros». No se mezclan desniveles de fichas Trailforks con otra geometría.
- Fuente OSM bajo ODbL, SHA256 `b8926fb02ddcc2410850d831312e64a5c51e5aeb9db49ce970a86e418a0df318`. Sin simplificación de datos ni uniones; render Leaflet `smoothFactor: 0`. No se afirma precisión de terreno. Transformación de fotografía `null`; navegación no validada.

## Verificación ejecutada

- `npm test`: 30/30, incluyendo catálogo, geometría, ejes, nodos/IDs/versiones, anclas, distancias y empaquetado con bytes exactos. Baseline previo: 25/25. Nuevas pruebas de catálogo y flujo se observaron fallar antes de la implementación.
- `npm run test:geographic:browser`: 9/9; elección de parque, dimensiones iguales, atribución OSM visible, desplegables, pantalla completa, selección, fuentes, contexto apagado y vuelta atrás.
- `npm run test:geographic:acceptance`: 9/9; teselas realmente cargadas, toque sobre línea real, pellizco/pan por eventos táctiles, zoom mundial/regreso, 360 px/rotación, fuente alterada, catálogo ausente, HTML autónomo y preservación real de almacenamiento con service worker activo.
- Suite fotográfica existente: 12/12 de navegador y prueba del HTML autónomo anterior. Las imágenes/vectoriales anteriores conservan sus controles y transformaciones.
- Revisión independiente: tres hallazgos P2 reproducidos con pruebas rojas y corregidos; `node tests/geographic-regressions.mjs`: 3/3. El encuadre reserva ancho cuando la ficha es lateral, hay atribución OSM visible en la barra superior y los enlaces del artefacto llevan al selector y al HTML fotográfico compañero.
- Preservación adicional: importar PNG real mediante el flujo anterior, guardar calibración válida, campos reales `trails/webCenter`, comparar Blob byte a byte, IDs, campos y localStorage antes/después de app → parque → app, recargar y reabrir imagen calibrada. Se usa un contexto de prueba nuevo; no se accede a mapas del usuario.

Los fallos iniciales del ensayo de zoom mundial se debieron a enviar teclas mientras Leaflet animaba; la prueba final espera cada nivel del control de zoom. La atribución oculta en la miniatura se detectó con prueba roja y se corrigió. No se han probado dispositivos físicos ni navegación GPS en terreno.

## Abrir y continuar

Local en este entorno: `npm run serve:geographic`, luego `http://127.0.0.1:4174/mapa-geografico.html`. Esta URL pertenece al entorno remoto; no es un enlace accesible desde el teléfono del usuario.

`npm run build:geographic` produce `dist/mapas-gps-parques.html`, con Leaflet y datos locales incluidos, y `dist/mapas-gps-revision.html` como revisión fotográfica compañera. Conservar ambos en el paquete para usar el enlace de revisión. El fondo OSM requiere conexión; no se descargan teselas masivamente. El alojamiento privado mantiene la revisión anterior completa, incluida la foto original recibida.

La biblioteca de fotos anterior permanece en su origen. El enlace «Mis mapas» del artefacto alojado abre `https://rodracruz.github.io/mapas-gps/`; Sites y GitHub Pages no comparten IndexedDB. No hay migración ni borrado.

Pendientes: geometrías utilizables de La Virgen/Starwars, ubicación exacta de servicios, contraste independiente de extremos/vigencia y datos para futura navegación. No afirmar que esas tareas quedan resueltas por este flujo móvil.
