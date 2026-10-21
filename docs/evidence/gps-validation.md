# Validación GPS tras incorporar los filtros

2026-10-21. Rama aislada `test/gps-validation`, base `13bd1af`, worktree `parquemet-coverage`. Se prueban y corrigen las funciones existentes; no se cambian las geometrías, permisos ciclistas, umbrales del motor ni transformaciones geográficas. Main, Pages y mapas guardados permanecen intactos.

## Fallos reproducidos y corrección

1. Demo: primer punto en 390×844, pantalla (54,215), tapado por los nuevos controles. La cámara reservaba un margen superior fijo de 175 px.
2. GPS nativo: al girar a 320×568 con ficha abierta, los paneles ocupaban todo el espacio disponible para la lectura.
3. Entrada normal al parque → abrir mapa → demo pausada → desplegar filtros: el observador inicial no incluía el cuerpo trasladado al mapa y el punto quedaba bajo los filtros.
4. Sin teselas en 320×568: el aviso de conexión ocupaba el espacio libre sobre el GPS.

`geographic/gps-viewport.mjs` calcula el mayor rectángulo libre de controles medidos, en píxeles CSS y con 12 px de separación para el punto y aro. Sólo mueve la cámara: las coordenadas GPS/OSM se conservan. La demo encuadra sus 49 posiciones; el seguimiento centra la lectura en la zona libre, responde al giro y a cambios de tamaño de controles. Arrastrar suspende el seguimiento; el botón de centrar lo recupera.

En teléfono corto, la ficha se limita al 25% de altura, con desplazamiento para el contenido. Si hay aviso de conexión durante el seguimiento, éste se integra en el panel GPS y la ficha ocupa como máximo el 18%; el aviso vuelve a su posición original al detener. El aviso previo de privacidad se conserva antes de activar la ubicación. El filtro se observa por su identificador estable aunque después se traslade al mapa.

También se reprodujo una carrera entre dos pruebas que escribían `dist/` simultáneamente: la suite inicial falló 1/128. Ahora ambas protegen la transacción completa construir/leer/verificar con un bloqueo del sistema operativo. Las aserciones de foto y alias siguen activas; el bloqueo se libera por EOF también ante interrupción del proceso. No se serializa toda la suite.

Los rótulos de Parquemet también podían cubrir parte del aro: ahora las cuatro capas GPS se dibujan en un panel Leaflet a z=650, por encima de los rótulos (600), sin capturar eventos táctiles. Se comprobó primero el fallo de orden de capas y después su corrección.

## Uso para probar

Vista previa privada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/#parque=el-durazno&mapa=1

- **Probar recorrido**: demo pública Lomo Vetado → Calibre 12, sin pedir ubicación. Se puede pausar y avanzar lectura a lectura. Debe mantener Lomo y cambiar tras el nodo compartido OSM `4705609090`, no por un simple cruce visual.
- **Mi ubicación**: pide permiso al navegador y muestra GPS real en OSM. Punto pequeño = lectura; aro hueco = ajuste probable; círculo = precisión declarada. Fuera de la red importada puede mostrar ubicación sin identificar sendero. Parquemet usa su propia red y no ofrece la demo de El Durazno.
- **Detener GPS** o cerrar el mapa: cancela el seguimiento y limpia la sesión. El cartel aproximado nunca sirve para ajustar GPS.

No se guardan posiciones ni trazas en almacenamiento local ni se envían a un backend de la app. Las teselas OSM sí revelan el área consultada al proveedor. Se mantienen las advertencias existentes; véase [privacidad y límites del motor](gps-continuity.md).

## Pruebas reproducibles

Desde la raíz del checkout, con Chromium y dependencias existentes:

```sh
npm test
python3 scripts/build-geographic-standalone.py
python3 -m http.server 4183 --bind 127.0.0.1
```

En otra terminal de esa misma máquina:

```sh
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 node tests/gps-browser.mjs
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 npm run test:gps:layout
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 npm run test:gps:storage
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 GPS_ENTRY=/dist/index.html node tests/gps-layout-browser.mjs
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 GPS_ENTRY=/dist/index.html PARK_ENTRY=/dist/parquemet.html node tests/gps-follow-browser.mjs
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 node tests/geographic-regressions.mjs
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4183 FILTER_BUNDLE=1 node tests/route-filters-browser.mjs
```

`localhost` es local a la máquina que sirve los archivos; no es una vista accesible desde otro equipo. `npm test` reconstruye el paquete público; para alojar la foto privada hay que generar después con `--reference-photo` apuntando al original fuera de Git. La foto, `dist/` y ZIP privados nunca se añaden al repositorio público.

La suite de visor comprueba las 49 lecturas en 390×844, 844×390, 320×740, 667×375 y 320×568, aro hueco, botón GPS accesible y expansión de filtros con demo pausada. La prueba nativa usa la API real de Chromium con coordenadas públicas emuladas: adquiere pista probable en ambos parques, ficha, giros, recentrado, precisión de 100 m sin ajuste, detención y ausencia de teselas con aviso visible. La suite GPS existente cubre opt-in, continuidad y cambio de pista por nodo compartido, Cartel sin ajuste, pérdida temporal, caducidad, recuperación, permiso rechazado, cancelación al cerrar, ausencia de escrituras y estado guardado intacto.

La prueba adicional `gps-storage-browser.mjs` importa una imagen sintética en la app anterior y activa su service worker real; compara bytes de Blob, calibración, senderos guardados, centro web y todo localStorage antes/después de abrir el parque, reproducir GPS y volver a abrir el mapa original. Pasó sin cambios en esos datos.

## Límites

Estas son pruebas automatizadas de navegador y datos públicos simulados. No equivalen a GPS en un teléfono físico, ni a una salida en bicicleta, medición de precisión real, comprobación de accesos o autorización de sentidos. Las hipótesis de correspondencia geográfica pendientes siguen pendientes. No se simula una validación sobre terreno. [Evidencia de esta entrega y capturas](gps-validation-release.md).
