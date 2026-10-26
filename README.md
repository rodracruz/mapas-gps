# bikeride

Aplicación de parques y senderos para móvil, con planos originales, mapa mundial y GPS voluntario. El repositorio conserva su nombre `mapas-gps`; la marca visible es **bikeride**.

La implementación actual está en `feat/bikeride-stitch-integration`. [Estado y continuación](docs/handoff/stitch/ESTADO-STITCH.md) · [Corrección visual, pruebas y capturas](docs/evidence/bikeride-visual/README.md).

La [publicación privada existente](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site) está actualizada a la versión 20, con comparación al mismo tamaño y fichas con cuerpo/acciones visibles. GitHub main y Pages no se han modificado.

## Desarrollo

Sirve el repositorio por HTTP (`python3 -m http.server 4174`) y abre `http://localhost:4174/mapa-geografico.html`. La biblioteca anterior de imágenes permanece en `index.html`, conservando su origen y almacenamiento.

`npm test` ejecuta la suite de datos y construcción. Las pruebas de construcción escriben en `dist/`; usa una copia aislada para conservar cualquier construcción privada existente. `npm run build:geographic` genera la aplicación autónoma. La opción `--reference-photo` del constructor permite incorporar el adjunto privado sólo a una construcción privada, sin añadirlo al repositorio.

## Referencia histórica de las entradas anteriores

El estado vigente es el enlazado arriba; estas notas conservan el contexto de las primeras entregas.

## Parques y senderos · móvil

La nueva entrada es [mapa-geografico.html](mapa-geografico.html): elegir parque, consultar servicios y fichas desplegables, abrir un mapa mundial a pantalla completa y tocar una pista para ver su información inferior. Las tarjetas cerradas comparten tamaño. La biblioteca fotográfica anterior continúa disponible.

```sh
npm ci
npm run serve:geographic
# http://127.0.0.1:4174/mapa-geografico.html
```

Cada ficha distingue la geometría disponible, la fuente y lo pendiente. Los catálogos actuales incluyen21 fichas de El Durazno y26 de Parquemet; no se inventan velocidades, desniveles ni ubicaciones de servicios.

Construir con `npm run build:geographic`. Pruebas: `npm test`, `npm run test:geographic:browser`, `npm run test:geographic:acceptance` y `npm run test:geographic:regressions`. [Evidencia y pendientes](docs/evidence/mobile-parks.md). El HTML y los datos se incluyen localmente; el fondo cartográfico requiere conexión.


Aplicación web móvil para posicionarse con GPS sobre imágenes de mapas de senderos.

El desarrollo del visor vectorial está en `feat/fiel-vector-review`. Para retomar el estado, reproducir pruebas y conocer los límites cartográficos, leer [Continuar el desarrollo](docs/continuar-desarrollo.md).

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

### Acceso directo privado

[Abrir parques y senderos](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site) — aplicación privada en Sites, accesible con la cuenta propietaria de ChatGPT; la revisión fotográfica está enlazada desde el parque. Publicación actual y comprobaciones en [mobile-private-release.md](docs/evidence/mobile-private-release.md); historial fotográfico en [private-site.md](docs/evidence/private-site.md). La publicación GitHub Pages original y main no se modificaron.

La revisión incluye ahora el mapa oficial alineado de mayor detalle (1800 × 2200) y un selector para contrastarlo con la foto original. `npm run test:sources` comprueba que cambiar de fondo mantiene la geometría y el encuadre. La opción de construcción `--reference-photo /ruta/a/foto.jpg` incorpora una foto completa únicamente al HTML generado; ese archivo no se añade al código público. La copia privada incluye la foto completa recibida y su análisis está en [new-photo-81184.md](docs/evidence/new-photo-81184.md).

### Validación GPS en ambos parques

[Pruebas y uso del GPS](docs/evidence/gps-validation.md): ubicación opt-in, demo pública, continuidad de pista OSM y correcciones de visibilidad en móvil tras añadir filtros. [Evidencia de entrega](docs/evidence/gps-validation-release.md). La verificación usa coordenadas públicas emuladas; no acredita navegación sobre terreno.
