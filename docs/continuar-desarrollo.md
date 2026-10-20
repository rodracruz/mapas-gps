# Continuar Mapas GPS

## Estado más reciente: cuatro filtros con mapa estable

Rama `feat/park-route-filters` sobre `b24e40a`, worktree aislado `parquemet-coverage`. Panel compartido en El Durazno y Parquemet: tipo documentado, longitud OSM, cercanía y dificultad donde existe. Mapa primero y mismo nodo/rectángulo/cámara al filtrar; fichas y capas cambian. Cercanía es distancia al tramo OSM con lectura puntual opt-in, sin usar registro del cartel, iniciar seguimiento ni persistir ubicación. Lecturas caducan a 60 s y requieren precisión ≤100 m. Ordenes de longitud/cercanía mutuamente excluyentes. No modificar fuentes ni geometrías para hacer funcionar filtros. [Decisiones, pruebas y capturas](evidence/route-filters.md). Main/Pages, fotografía privada y biblioteca se conservan.

## Estado anterior: avenidas visibles y contrastadas

Rama `fix/parquemet-avenues`, sobre `7e72be7`, worktree aislado `parquemet-coverage`. Parquemet: ocho ciclistas + seis compartidos + doce avenidas/caminos. Filtros por categoría, avenidas azules, selección y recortes del plano. Diez recortes rotulados; Neruda/Elizalde son referencias de tabla sin miniatura ubicada. Los polígonos blancos del PDF no se presentan como curvas individuales. Nueva fuente atómica116vías/2694nodos preserva los2722objetos anteriores;103vías atribuidas,91elegibles para GPS. Gabriela Mistral y vías sin permiso permanecen visibles pero fuera del matcher. Los Turistas sigue pendiente de delimitar. [Implementación, capturas y pruebas](evidence/parquemet-avenues.md), [versión privada15 y PR #9](evidence/parquemet-avenues-release.md), [PDF](evidence/parquemet-avenues-pdf.md), [OSM](evidence/parquemet-avenues-geographic.md). No tocar main/Pages ni subir fotografía privada.

## Estado anterior: los seis tramos compartidos que faltaban

Rama `fix/parquemet-shared-routes` sobre `0055d5b`, worktree aislado `parquemet-coverage`. Parquemet incluye ahora las14rutas con uso ciclista de la edición recibida: ocho rojas y seis verdes del Paseo Metropolitano. Fichas/recortes del plano y selección en mapa mundial para todos; estilos nativos verdes y hueco de Los Sentidos conservados. La omisión geográfica se debía a excluir `highway=pedestrian`, aun cuando las vías declaran bicicletas. Nueva fuente atómica `sources/parquemet-shared-osm.json`:106vías/2615nodos,31vías nominales del Paseo,28con permiso ciclista explícito;84vías totales elegibles para el matcher. Las tres de Pedro restringidas/sin permiso quedan fuera. La fuente anterior permanece intacta y todos sus2042objetos son idénticos en la consulta nueva. [Implementación y pruebas](evidence/parquemet-shared.md), [versión privada14 comprobada y PR #8](evidence/parquemet-shared-release.md), [geografía contrastada](evidence/parquemet-paseo-geographic.md), [curvas originales](evidence/parquemet-paseo-pdf.md). No se georreferencia el PDF esquemático ni se mezclan ediciones.

## Estado anterior: fondo del plano en las vistas de ruta

Rama `fix/official-map-preview-background`, sobre `2a0786b`, reutiliza el worktree aislado `parquemet-coverage`. Las ocho fichas ciclistas de Parquemet y veinte de El Durazno muestran un recorte del plano oficial como fondo, tanto en miniatura como al desplegar y ampliar. Se conserva el entorno cercano y se resalta la curva original en el mismo sistema de píxeles. Las imágenes originales se comprueban por SHA256 y se comparten entre las fichas; no se genera ni modifica el contenido del plano. [Implementación, capturas y pruebas](evidence/map-preview-background.md), [versión privada13 verificada y PR #7](evidence/map-preview-background-release.md). Si falla el fondo, los vectores del mapa geográfico se mantienen. No alterar curvas/datos GPS para ajustar una miniatura.

## Estado anterior: cobertura ciclista y miniaturas oficiales

Rama `fix/parquemet-cycling-coverage`, worktree `parquemet-coverage`, sobre `d57cd34`. Parquemet muestra ocho senderos ciclistas OSM rotulados, nueve avenidas secundarias y los ocho recorridos nativos del PDF en un visor separado. Las fichas incluyen miniatura y ampliación de sólo la ruta oficial (ocho Parquemet y veinte El Durazno); Subida Buitrera no toma por semejanza una subida del cartel. Restricciones OSM siguen excluidas del GPS. El PDF permanece esquemático, sin transformación geográfica. [Implementación y pruebas](evidence/parquemet-coverage.md), [publicación privada verificada y PR #6](evidence/parquemet-coverage-release.md), [correspondencias y fuentes](evidence/parquemet-coverage-sources.md), [extracción exacta del PDF](evidence/parquemet-pdf-traces.md). `main`, Pages, foto privada y mapas guardados se conservan.

## Estado anterior: segundo parque Parquemet

Rama `feat/parquemet-second-park` sobre `fa298ab`. Selector común ofrece El Durazno y Parquemet; el nuevo controlador `geographic/park-viewer.mjs` usa catálogo/documento/snapshot del registro elegido. PDF oficial público intacto y render6690×2835 ampliable en coordenadas propias. Ocho fichas ciclistas, seis correspondencias nominales OSM, dos avenidas principales; Zorzal y Pa’ arriba pendientes frente a variantes OSM. Longitudes PDF y OSM separadas, restricciones por tramo y GPS opt-in sólo en red nominal compatible; sin demo Lomo de otro parque. El Durazno, la foto privada, sus capas y la biblioteca guardada se conservan. [Implementación y pruebas](evidence/parquemet.md), [publicación privada comprobada y PR #5](evidence/parquemet-release.md), [fuentes geográficas](evidence/parquemet-geographic.md), [PDF e imagen](evidence/parquemet-official-document.md). No usar el PDF esquemático como calibración GPS ni mezclar ediciones.

## Estado anterior: continuidad GPS experimental

Rama `feat/gps-route-continuity` sobre `bf2c939`. En Mapa de senderos, Mi ubicación activa GPS bajo permiso; mantiene la pista probable mediante continuidad y reevalúa tras nodos OSM compartidos. Señal dudosa/antigua suspende ajuste; evidencia fiable incompatible permite readquirir sin bloqueo permanente. Probar recorrido ofrece una demo pública Lomo→Calibre12 con pausa y avance, sin solicitar ubicación. El dibujo del cartel sigue sin ajuste GPS. No se guardan recorridos; el fondo OSM carga teselas del área visible (aviso previo). [Implementación, pruebas y límites](evidence/gps-continuity.md), [despliegue privado comprobado y PR #4](evidence/gps-continuity-release.md), [motor](evidence/gps-matcher.md), [demo](evidence/gps-demo.md). Esta identificación no implementa navegación ni valida accesos/sentidos/loops/distancias restantes.

## Estado anterior: curvas del cartel en Mapa de senderos

La fuente predeterminada de «Mapa de senderos» ahora es Cartel: curvas originales completas del PDF oficial, con nombres y puntos encima, sobre el mapa mundial. La posición es experimental y permanece marcada «Ubicación aproximada · Sin ajuste GPS». OSM sigue como comparación; sus longitudes se identifican como OSM. [Método, límites y pruebas](evidence/continuous-cartel.md), [registro experimental](evidence/cartel-registration.md). Datos separados `continuous-sign-trails.json` (píxeles) y `cartel-registration.json` (modelo de presentación no aceptado para GPS). No volver a confundir líneas OSM nominales con el dibujo exacto del cartel.

## Ajuste anterior: mapa legible en portada

Se reemplazó la miniatura estrecha por la fuente oficial2570×3077 a todo el ancho del panel, encuadrada sobre el área del mapa. Tocar «Ampliar mapa» abre el visor existente en modo Cartel, con zoom. La fotografía privada960×1280 sigue intacta en «Ver tu fotografía original»; ya no sustituye la fuente de alta resolución de portada. [Encuadre y verificaciones](evidence/park-image-framing.md).

## Estado anterior: todos los senderos y foto principal

Rama `feat/all-trails-from-sign` sobre `156a270`: foto privada original en la página principal de El Durazno,20 senderos del cartel y2 subidas en plano visual separado,21 fichas y13 vías OSM nominales. [Método, límites y pruebas](evidence/all-trails.md), [catálogo geográfico](evidence/all-catalog.md). Datos editables `data/el-durazno/all-visual-trails.json`: píxeles2570×3077,104 fragmentos,72.831 vértices,164 huecos. Ningún ajuste GPS ni conexión inferida.

Código en [PR #3 en borrador](https://github.com/rodracruz/mapas-gps/pull/3), apilado sobre #2. [Despliegue comprobado](evidence/all-trails-release.md). La vista privada mantiene su URL; `main` y los datos locales del usuario siguen intactos. Para reconstruir con el adjunto privado se debe pasar `--reference-photo` al constructor. Sin ese argumento se usa la fuente oficial pública identificada como tal. No subir `dist/` ni el adjunto al repositorio público.

## Estado anterior: flujo móvil ejecutado

Rama activa `feat/mapa-geografico`, [PR #2 en borrador](https://github.com/rodracruz/mapas-gps/pull/2). Entrada `mapa-geografico.html`: elegir parque → información/servicios → tarjetas iguales de mapa y senderos → detalles desplegables → mapa a pantalla completa con ficha inferior al tocar pista. Uso móvil95%; no volver a sustituir las capas por widgets de otros proveedores.

La [aplicación privada](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site) ya abre ese flujo. Contiene capas OSM de Subida Buitrera y Lomo; La Virgen/Starwars tienen ficha y geometría pendiente. El mapa es mundial y persistente. Dificultad/servicios conservan fuente; desnivel/velocidad no se inventan. [Evidencia y pruebas](evidence/mobile-parks.md), [publicación comprobada](evidence/mobile-private-release.md) y [registro de decisiones](execution-mobile.md).

`main`/GitHub Pages y la biblioteca anterior no cambian. El enlace Mis mapas del sitio privado conserva el origen original; no hay migración entre IndexedDB de diferentes orígenes. La revisión fotográfica permanece accesible desde el parque.

## Historial del hito fotográfico

Estado del trabajo: 2026-10-18. Repositorio: https://github.com/rodracruz/mapas-gps. Rama de desarrollo: `feat/fiel-vector-review`. La aplicación anterior y sus almacenes de mapas permanecen intactos; no fusionar esta rama sobre `main` sin aprobación del propietario.

El avance está subido a GitHub y se revisa en el [PR #1, en borrador](https://github.com/rodracruz/mapas-gps/pull/1). `main` sigue en `87edc6c`; crear o publicar otra configuración de Codex Cloud no fusiona esta rama ni traslada automáticamente el estado de este hilo.

## Entrega que se está revisando

El primer hito es un visor de revisión de Starwars, La Virgen y Lomo Vetado, no una red navegable. Abrir `revision.html` con un servidor HTTP o el [visor privado alojado](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site). Este alojamiento es independiente de GitHub Pages.

El original público de 900 × 1100 se conserva sin cambios. La fuente oficial de mayor resolución está alineada a ese mismo plano; cambiar de fondo no modifica las coordenadas. La foto completa del usuario se conserva fuera del repositorio público y solo se incluye opcionalmente en la copia privada.

La lista **Revisar zonas pendientes** permite encuadrar cualquiera de las seis zonas actuales y alternar las dos fuentes desde el mismo recorte. La validación propia e independiente resolvió los dos zigzags visibles de La Virgen y ajustó un gancho de Lomo Vetado. Su evidencia y límites están en `docs/evidence/visual-validation.md`; el registro del despliegue actual está en `docs/evidence/private-site.md`.

- Datos editables: `data/el-durazno/visual-trails.json`.
- Muestras previas a simplificación: `data/el-durazno/centerline-samples.json`.
- Observaciones y correcciones visuales editables: `data/el-durazno/visual-corrections.json`.
- Ajuste visual entre imágenes: `data/el-durazno/image-registration.json`.
- Investigación geográfica separada: `data/el-durazno/geographic-references.json`.
- Método y límites: `docs/evidence/primer-hito.md`.
- Evidencia y pruebas: `docs/evidence/verification.md`.
- Revisión por zona, recortes y causas de incertidumbre: `docs/evidence/pending-review.md`.

## Qué protege la carga

El visor admite aquí coordenadas de imagen con transformación identidad. Los extremos de cada fragmento deben coincidir con sus nodos visuales; los nodos no se comparten entre fragmentos. Cada sendero seleccionable necesita al menos un fragmento para poder encuadrarlo.

Los recuadros mantienen estado pendiente, fuente conocida y geometría nula. Se comprueban aristas completas frente al interior de los recuadros del mismo sendero, con la banda de límite de 3 px. Esta comprobación encuentra también una línea que cruce el hueco aunque ambos vértices estén fuera. La banda no es un permiso para interpolar ni una tolerancia geográfica. El JSON actual tiene 10 fragmentos, 253 vértices y 6 zonas pendientes. Todos los IDs originales se conservan; `virgen-tight-turns` pasa de `gaps` a `visualReviews`, y el fragmento añadido es `la-virgen-s05`.

Una edición que viole estos contratos se rechaza antes de dibujar o habilitar la descarga. Estos contratos no sustituyen la comparación visual de nuevas geometrías.

## Reproducir pruebas

Desde la raíz de la rama, ejecutar `npm ci` si faltan dependencias y arrancar `npm run serve`. En otra terminal:

```sh
npm test
npm run test:browser
npm run test:sources
npm run build:standalone
npm run test:integrity
npm run test:pending
npm run test:standalone
```

Abrir `http://127.0.0.1:4173/revision.html` en la misma máquina que sirve el repositorio. Es una URL local de desarrollo. `test:integrity` usa como foto de prueba un JPG público ya incluido; no requiere adjuntos privados. Inyecta un error transitorio de decodificación y confirma que el siguiente intento vuelve a verificar y mostrar la imagen.

Para actualizar el sitio privado, conservar su ID en la copia de alojamiento y su audiencia del propietario. Generar el HTML con `scripts/build-standalone.py --reference-photo /ruta/privada/a/la/foto.jpg` solo cuando se deba incluir el adjunto. No añadir `dist/` con adjuntos privados ni credenciales a GitHub.

## Próxima decisión cartográfica

La revisión técnica de las curvas visibles ya se ejecutó; no se delega al usuario. Quedan cinco rótulos y el extremo inferior de Lomo Vetado por contrastar. Los contornos del PDF aportan evidencia de su propio dibujo bajo las placas; no demuestran por sí solos la edición exacta de lo oculto en la foto. La investigación verificó otra vez las 10 referencias OSM, pero mantiene cero correspondencias píxel/geografía aceptadas. Faltan controles inequívocos e independientes para evaluar una transformación; no hay ajuste GPS validado.

Destinos, loops, distancias sobre caminos, sentidos y ajuste GPS quedan para después de validar esas correspondencias y la conectividad. No reutilizar las geometrías ilustrativas de `visor-vectorial.html` como datos comprobados.
