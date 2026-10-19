# Curvas completas del cartel sobre el mapa mundial

El propietario pidió que «Mapa de senderos» usara los recorridos del cartel, que continuaran bajo rótulos y puntos, y que estos elementos se dibujaran encima. La tarjeta anterior mostraba otras líneas, procedentes de OSM. Esta entrega cambia la fuente gráfica predeterminada a **Cartel**, manteniendo **OSM** como comparación explícita en el mismo mapa mundial.

## Geometría y orden de dibujo

El PDF oficial conserva las curvas originales debajo de la impresión. Se recuperan esos objetos, sin inventar uniones ni sustituir curvas por segmentos rectos. El nuevo `data/el-durazno/continuous-sign-trails.json` contiene20 senderos,2 subidas,23 paths Bézier originales,29 rótulos y45 marcas. Sus tres capas se dibujan en orden: recorridos, textos, puntos/símbolos. La transformación del PDF a2570×3077 sólo expresa las coordenadas en píxeles del JPG oficial. No se rectifica ni se deforma cada sendero.

Se recuperan162 huellas cubiertas a partir de geometría realmente existente en el PDF. No son tramos observados bajo la tinta de la fotografía; su procedencia se conserva. Las39 ramas ambiguas del eje medial quedan documentadas para análisis y no crean conexiones. El render usa los contornos y Bézier auténticos, sin depender de esa topología auxiliar. Cero conexiones transitables se derivan de cruces o círculos. El dataset visible anterior sigue intacto con sus huecos y SHA `f68ae492e04724e2cbad56a3bf64910868c237a486a4576b6c48fb0f526d1368`.

Nuevo SHA `73521732a4b58bcd14a0aefc17697dca35e5aa05f8f7bd5d3830f2c661f56f78`. [Comparación](continuous-cartel/comparison.png), [plano limpio](continuous-cartel/clean.png) y [auditoría reproducible](continuous-cartel/audit.json). La serialización SVG se contrastó con primitivas PDF independientes: RMS RGB0,0874/255, máximo14, cero píxeles con error superior a32. Los ejes auxiliares tienen86.103 vértices y aristas≤0,354px, pero no se utilizan para simplificar el render.

## Posición sobre el mapa mundial

Se usa una sola semejanza experimental entre el cartel y formas nominales OSM, documentada en [cartel-registration.md](cartel-registration.md) y `data/el-durazno/cartel-registration.json`. El SVG nativo se compone con esa semejanza y la proyección Mercator de Leaflet; el zoom y el desplazamiento afectan a curvas, rótulos y puntos conjuntamente. Las teselas mundiales siguen siendo OSM.

El registro **no está validado para GPS**. No hay controles geográficos inequívocos aceptados ni referencias independientes de terreno. Las formas retenidas fuera del ajuste ayudan a comparar; no acreditan una precisión. XL, Rock N’Roll y Los Saltos tienen extensiones OSM distintas. La zona norte es extrapolación. Por ello el mapa muestra de forma persistente «Ubicación aproximada · Sin ajuste GPS». La ficha Cartel indica «Sin medir»; las longitudes de tarjetas siguen identificadas expresamente como OSM. No se calculan distancias de terreno a partir de píxeles ni se exporta el cartel como GeoJSON.

Al alternar fuentes, se mantienen sus controles de visibilidad por separado. Los rótulos nativos conservan su posición; los nombres de pantalla facilitan la lectura y evitan solaparse al alejar. Seleccionar una pista destaca sus nombres. La foto de alta resolución y el original privado continúan accesibles.

## Comprobaciones

42 pruebas unitarias;9 de flujo móvil OSM;9 de aceptación geográfica y conservación de Blob/calibración/IndexedDB con service worker activo;3 regresiones; revisión de todos los senderos, toque, pinch y recuperación de fondo. Nuevo `tests/cartel-world-browser.mjs`: paths exactos del PDF,29 rótulos,45 marcas, teselas reales, alineación SVG/Mercator antes y después de zoom, toque sobre curva, ficha sin distancias inventadas, comparación OSM, visibilidad y móvil320px. La revisión independiente encontró0,83px de discrepancia máxima de pantalla entre29 centros SVG y marcadores Leaflet, compatible con redondeo; no es una medición de precisión geográfica.

Se corrigieron la atribución ambigua de longitudes OSM en tarjetas, el estado de checkboxes al cambiar de fuente y la selección táctil del plano de revisión. Esta última resuelve la curva más cercana a la posición real del toque, evitando que el navegador elija otra curva próxima por su área de contacto.

La inspección de imágenes y las pruebas usan Chromium con gestos/emulación móvil; no se probó en un teléfono físico, no se validó GPS y no hay navegación habilitada.

## Reproducir

```sh
python3 scripts/build-continuous-sign.py --pdf /ruta/al/official-map.pdf
python3 scripts/fit-cartel-registration.py
npm test
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4175 node tests/cartel-world-browser.mjs
```

El PDF se obtiene de la URL y SHA registradas; el script rechaza otra fuente. El ajuste usa sólo archivos locales públicos y no modifica OSM ni los datos del usuario. Para el ejecutable privado se conserva `scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg`. No subir `dist/`, adjuntos privados o credenciales a GitHub. `main` y GitHub Pages permanecen intactos.

## Actualización privada comprobada

Despliegue `appgdep_6ad5850bcd0c81919b1bf863d583f453` succeeded,19-10-2026,02:49UTC (18-10-2026,23:49 America/Santiago), en la [misma URL privada](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site). Código `86a7581`, copia de alojamiento `0ffabf131d89277305efa3d45c72e5cd3ac15c58`. HTML3.356.604bytes, SHA-256 `a3931d31b606bce3d4263aed9e115af8e21a6d38239243587814478c9f8931d3`, idéntico al archivo local probado.

Diez comprobaciones en el sitio alojado: acceso propietario/401 anónimo; bytes publicados; selección de parque; fuente principal2570×3077 y original privado960×1280 preservados;23 paths del cartel con alineación raster/vector; fichas desplegables; mapa mundial con10 teselas;29 rótulos/45marcas, aviso aproximado, «Sin medir» y comparación OSM con13 vías; revisión anterior conservada; cero errores JavaScript. [Resultado](continuous-cartel/live-verification.json), [captura del sitio con selección](continuous-cartel/live-world-selected.png).

El ZIP privado actualizado fue descargado con200 y coincidió exactamente:8.458.376bytes, SHA-256 `6c11f999f7a5a8586b80b7e426067af0742b35b304a2aee0592b6ffd26eed5b9`. Incluye ejecutable, imagen, datos en píxeles y registro experimental separado. La fotografía privada permanece sólo en el alojamiento y artefactos ignorados. Código y documentación en [PR#3 en borrador](https://github.com/rodracruz/mapas-gps/pull/3), apilado sobre #2. Main remoto continúa en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`.
