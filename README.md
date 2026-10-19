# Mapas GPS · Senderos

## Parques y senderos · móvil

La nueva entrada es [mapa-geografico.html](mapa-geografico.html): elegir parque, consultar servicios y fichas desplegables, abrir un mapa mundial a pantalla completa y tocar una pista para ver su información inferior. Las tarjetas cerradas comparten tamaño. La biblioteca fotográfica anterior continúa disponible.

```sh
npm ci
npm run serve:geographic
# http://127.0.0.1:4174/mapa-geografico.html
```

El primer catálogo es El Durazno: Subida Buitrera y Lomo Vetado tienen líneas nativas de OSM; La Virgen y Starwars tienen fichas y geometría pendiente. No se inventan velocidades, desniveles ni ubicaciones de servicios.

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

[Visor de revisión de El Durazno](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site) — copia privada en Sites, accesible con la cuenta propietaria de ChatGPT. Publicación y comprobaciones documentadas en [private-site.md](docs/evidence/private-site.md). La publicación GitHub Pages original y main no se modificaron.

La revisión incluye ahora el mapa oficial alineado de mayor detalle (1800 × 2200) y un selector para contrastarlo con la foto original. `npm run test:sources` comprueba que cambiar de fondo mantiene la geometría y el encuadre. La opción de construcción `--reference-photo /ruta/a/foto.jpg` incorpora una foto completa únicamente al HTML generado; ese archivo no se añade al código público. La copia privada incluye la foto completa recibida y su análisis está en [new-photo-81184.md](docs/evidence/new-photo-81184.md).
