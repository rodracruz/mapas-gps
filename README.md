# Mapas GPS · Senderos

Aplicación web móvil para posicionarse con GPS sobre imágenes de mapas de senderos.

### Probar
- Abre `https://<usuario>.github.io/<repo>/` (tras activar Pages) desde Android en Chrome.
- Abre `RKF El Durazno` o importa una imagen JPG/PNG/WebP.
- Pulsa **Calibrar** y marca un punto reconocible en la foto; elige sus coordenadas reales en OpenStreetMap, de forma manual o usando GPS sobre el terreno. Repite con 4+ puntos distribuidos.
- Activa GPS para ver tu posición azul.

### Publicación en GitHub Pages
Abre el repositorio en GitHub → **Settings** → **Pages** → **Build and deployment** → Source: **Deploy from a branch** → Branch: **main**, folder **/(root)** → **Save**. Espera a que GitHub publique y recarga la dirección indicada.

### Privacidad y seguridad
Fotos, puntos de control y GPS se procesan localmente; solo OpenStreetMap carga mosaicos de referencia online durante calibración. La PWA requiere HTTPS. Prototipo experimental no validado para seguridad de navegación en terreno.

### Nuevo: plano digital con GPS (v2)
En un mapa importado, toca **🌐 Plano GPS**. Puedes buscar el sector por nombre, consultar senderos OSM desde internet y verlos dibujados como líneas vectoriales georreferenciadas. También puedes usar la vista satelital de referencia, ver la foto al lado, activar GPS directamente en el plano sin calibrar la foto, guardar trazados localmente y exportar GeoJSON. La fotografía NO se ajusta automáticamente a las coordenadas de OSM ni se identifican las pistas del cartel sin comprobación: la coincidencia necesita validación. El servicio de rutas es público y puede fallar o estar incompleto. Los mosaicos online no se guardan sin conexión; los trazados GIS sí.


### Hito de revisión fiel (rama `feat/fiel-vector-review`)

Visor ejecutable separado en `revision.html`: fotografía original, tres senderos (Starwars, La Virgen y Lomo Vetado), capas, opacidad, solo vectores, selección, zoom y desplazamiento táctil. 9 fragmentos / 245 vértices, 7 zonas pendientes sin enlaces inventados. Coordenadas de imagen; **sin georreferenciación validada**.

- Abrir: `python3 -m http.server 4173`, después `http://127.0.0.1:4173/revision.html`.
- HTML autónomo descargable: `python3 scripts/build-standalone.py` genera `dist/mapas-gps-revision.html` con foto, datos y evidencia incrustados.
- Datos editables: [visual-trails.json](data/el-durazno/visual-trails.json).
- Método y límites: [primer hito](docs/evidence/primer-hito.md), [referencias geográficas](docs/evidence/geographic-references.md), [verificaciones](docs/evidence/verification.md).
- Pruebas: `npm ci`, `npm test`; con el servidor activo: `npm run test:browser`. Chromium del sistema en `/usr/bin/chromium` o variable `CHROMIUM_PATH`. `npm run build:standalone && npm run test:standalone` comprueba el artefacto sin recursos externos.

Los archivos de aplicación previos, el original JPG, el service worker y la base de datos permanecen intactos. Este visor no exporta GeoJSON ni convierte sus líneas en metros.
