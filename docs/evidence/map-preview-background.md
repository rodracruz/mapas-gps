# Vistas de ruta con el plano original de fondo

2026-10-20. Corrección solicitada sobre la entrega de miniaturas: la ficha debe mostrar la ruta sobre el plano original, recortado a su entorno cercano, en vez de una curva sobre fondo liso. Rama `fix/official-map-preview-background`, base `2a0786b`, worktree aislado existente `parquemet-coverage`. No cambia `main`, la biblioteca local, la foto privada ni la geometría.

`geographic/trail-preview.mjs` coloca la imagen original y los comandos de la ruta en el mismo SVG. Un viewport anidado recorta ambos a los límites del sendero más un margen del7% de su dimensión mayor. Ese margen es de presentación, no una tolerancia geométrica: las curvas no se simplifican, no se trasladan y no se rellenan huecos. El recorte también impide que otras partes del plano invadan las bandas laterales del encuadre.

Las ocho fichas ciclistas Parquemet y veinte fichas identificadas El Durazno tienen fondo tanto cerradas como desplegadas. La vista desplegada tiene228px y las tarjetas cerradas siguen en176px. El toque abre la superposición con el fondo a100%, encuadrada sobre el sendero. Se conservan zoom y desplazamiento, y los controles de opacidad y sólo vectores siguen disponibles. Los elementos cercanos del plano —nombres, iconos y otras líneas impresas— forman parte de la imagen y no se borran. Se resalta la curva seleccionada sobre el recorte.

Parquemet reutiliza el Blob JPEG ya comprobado por su controlador. El Durazno verifica el JPEG oficial contra `image.sha256` antes de crear un Blob común para sus veinte fichas. Si falla el archivo o el hash, no se muestran miniaturas sin plano como un resultado correcto; se informa el fallo y se conserva la capa vectorial geográfica y la opción de reintentar el fondo en el visor. Buitrera continúa sin un dibujo específico atribuido. No se usa la fotografía privada del usuario para estos recortes ni se modifica el contenido de ninguna imagen.

## Evidencia ejecutada

- Prueba nueva `node tests/trail-map-background-browser.mjs`: observada en rojo por ausencia de los ocho fondos Parquemet; luego verde en fuente y standalone (`BACKGROUND_BUNDLE=1`). Verifica los28 fondos, hash idéntico al JPEG original, dimensiones nativas, recortes locales, matrices imagen/ruta idénticas y apertura ampliada con plano visible y opacidad completa. Capturas en390×844.
- `npm test`:102/102, incluyendo datos y geometrías originales, modelos de miniatura y construcción con bytes exactos.
- Regresiones `trail-preview-browser.mjs` y `parquemet-coverage-browser.mjs`, en fuente y bundle, actualizadas al contrato de imagen de fondo. Veinte fichas El Durazno sin atribución falsa de Buitrera; ocho rutas Parquemet, rótulos, restricciones, selección, matrices tras zoom, tarjetas176px y diseño320/390px.
- Revisión independiente de código y cuatro capturas: sin hallazgos bloqueantes. Prueba de fallo JPEG forzado503: los23 objetos vectoriales El Durazno siguen en la fuente `cartel`, no hay miniaturas sin plano y el visor ofrece reintento de fondo.
- Inspección visual directa de las cuatro capturas y prueba posterior del sitio HTTPS, registrada en la evidencia de publicación.

[Ficha Centenario](map-preview-background/parquemet-card.png), [Centenario ampliado](map-preview-background/parquemet-enlarged.png), [ficha La Virgen](map-preview-background/el-durazno-card.png), [La Virgen ampliada](map-preview-background/el-durazno-enlarged.png).

Se mantienen los límites anteriores: el PDF de Parquemet es esquemático y no se proyecta como geometría GPS; las restricciones y longitudes OSM no cambian. Esta corrección es visual. No se validaron físicamente accesos, sentidos o navegación.

Construcción: `python3 scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg`. Omitir el argumento para una construcción sólo con fuentes públicas. Los bundles permanecen ignorados por Git. Desarrollo local: servidor HTTP en el worktree y entrada `parquemet.html` o `mapa-geografico.html`; `localhost` sólo funciona en la máquina que ejecuta ese servidor.
