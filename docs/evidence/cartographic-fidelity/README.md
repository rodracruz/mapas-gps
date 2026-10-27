# Corrección documental y comprobación geográfica pendiente

27-10-2026. Candidato sobre `8f6d6ca`, misma rama `feat/bikeride-stitch-integration`. **No sustituye la publicación privada v22 ni acredita equivalencia geográfica.** Main, almacenamiento y originales conservados.

[Comparación ejecutable](index.html) · [Inventario trazable](inventory.json) · [17 candidatos geográficos](registration-review.json) · [Revisión independiente](final-review.md) · [Originales conservados](preserved-inputs.json).

## 1. Fidelidad al PDF: corregida la pérdida comprobada

El Durazno conservaba los 23 paths de 22 recorridos —20 senderos y dos subidas—, pero omitía cuatro objetos rojos de «Conexiones para expertos» y 64 verdes de «Conexiones». Se recuperan **68 objetos originales** del PDF oficial, con curvas y puntos separados tal como existen, sin interpolar sus huecos ni crear un eje continuo. Los objetos proceden de índices cero-base `0–3`, `278–339`, `357–358`; se guardan aparte en `data/el-durazno/cartel-context.json`. Los 343 paths previos de recorridos, rótulos y marcas coinciden con su fuente. No se encontró una asignación nominal equivocada que justificara redibujarlos.

El arte se dibuja bajo rutas/rótulos/puntos, en el mismo marco nativo 2570×3077 y la misma transformación existente. El dibujo303 supera el borde nativo y se recorta en x2570, como el original. Se mantienen rellenos y grosores fuente: Skills deja de sustituir su trazo nativo por un ancho fijo. La presentación mundial conserva ayudas separadas de visibilidad —1px mínimo y halo blanco3px—; esas ayudas no son la geometría editable ni una afirmación de igualdad de píxeles sobre OSM. La revisión del plano utiliza el estilo nativo, sin esas ayudas. La descarga editable incluye `graphicContext` con los68 objetos.

En Parquemet están identificados los43 objetos originales de los ocho senderos rojos, además de seis tramos del Paseo. No se encontró una rama roja omitida en la extracción. Se corrige la conversión indebida de11 trazos discontinuos a sólidos y la pérdida de círculos compartidos1269/1279 al aislar Centenario, La S, Zorzal y Pa’ arriba. Recuperar un símbolo compartido **no convierte el cruce en una conexión transitable**. Se conservan los dos huecos originales de Anfiteatro, tres grupos verdes sin atribución y todas las fuentes anteriores. Las ocho entradas amarillas peatonales siguen visibles en el documento, fuera del catálogo ciclista; las avenidas tienen recortes/referencias de tabla, sin ejes individuales extraídos del PDF.

Al activar GPS real, El Durazno conserva ahora el plano elegido; antes lo reemplazaba silenciosamente por OSM. Sobre el plano aproximado se ve la lectura original y su incertidumbre, sin punto ajustado ni promesa de pista elegida sobre esas curvas. El usuario puede elegir OSM explícitamente para el ajuste experimental anterior. La demo sigue siendo OSM, está rotulada y no registra actividad. También se mantiene accesible Detener GPS con ficha y fallo de teselas en teléfono pequeño.

## 2. Conservación de geometría/topología al transformar

Se conservan bytes de todos los datasets/snapshots anteriores y de la matriz. La prueba recorre todos los puntos de los95 segmentos: inversión numérica menor que1e-8px y conservación de distancias bajo la única semejanza, sin deformar rutas individualmente. La prueba de navegador comprueba la proyección en pantalla de95 puntos frente a EPSG:3857 después de zoom y desplazamiento, con umbral2px de error de presentación. Ese umbral admite redondeo de Leaflet/CSS y **no mide exactitud de terreno ni tolerancia de vectorización**. La simplificación documental es0px.

Los68 objetos añadidos son compuestos de puntos rellenos. No son68 tramos navegables. `connections: []`, transformación aceptada nula y restricciones de navegación/distancias permanecen. No se crean nodos por proximidad ni por cruce. El inventario distingue objetos del PDF, huecos, símbolos y nodos compartidos reales del modelo OSM, conservando sus IDs.

## 3. Geografía: no resuelta con estas fuentes

**Cero controles aceptados y cero comprobaciones independientes.** El Durazno conserva `acceptedTransform: null`: la matriz aproxima un dibujo al mapa, no transforma el cartel en un levantamiento. Diez recorridos del plano tienen correspondencia nominal OSM, sin acreditar igualdad de extremos/extensión. En Parquemet las14 correspondencias son nominales; el plano panorámico no aporta una transformación. Las comparaciones individuales de sus ocho senderos muestran el PDF y las vías OSM con encuadres independientes y norte arriba en la parte geográfica; no se fuerza una superposición falsa.

La revisión remota encontró contradicciones concretas: los extremos inferiores dibujados de Lomo Vetado y Calibre12 distan30,71672px —aproximadamente46,12m bajo el registro actual— y se habían propuesto para el mismo nodo OSM4705608441. Un ajuste invertible no puede satisfacer ambas identidades. Virgen y Buitrera son candidatos semánticos, pero un icono editorial, el extremo de un sendero y el hito real no son intercambiables. El acceso de la ampliación insertada tampoco es un píxel del mapa principal. No se promovieron estos candidatos a controles.

Se volvió a consultar la [página del operador](https://www.outlife.cl/parques/rkf-el-durazno/) el27-10-2026: mantiene el mismo JPG/PDF2022 y dirección de acceso, sin enlaces identificados a GPX/KML/GeoJSON ni pares píxel/coordenada. El PDF retenido no contiene registro geoespacial detectado. La búsqueda adicional en fuentes oficiales no aportó una fuente geográfica utilizable; otra edición esquemática de Parquemet no se mezcló con el documento solicitado. Esto no demuestra que esos datos no existan en otro lugar.

Para cerrar la geografía hace falta una fuente legítima que ubique los trazados —plano georreferenciado o trazas oficiales con edición y alcance— o correspondencias remotas inequívocas contrastadas con cartografía/ortofotos permitidas, con comprobaciones independientes distribuidas por la red. No se requiere que el usuario vaya físicamente. No se solicita una cantidad arbitraria de puntos como garantía; primero debe resolverse la identidad de los hitos y la deformación del dibujo. Las referencias y contradicciones concretas están en `registration-review.json`. No se utilizaron geometrías protegidas de Google/Trailforks ni se retiraron salvaguardas GPS.

## Verificaciones ejecutadas y límites

- `npm test`: **157/157**,0 fallos. Baseline antes del cambio:155/155.
- Extracción reproducida byte por byte contra el PDF oficial; hash del suplemento `e59fdc9967ebb5e84362a290b20708f5c72193290cb72a6f22138a8a7545663c`.
- Navegador en fuente y paquete privado: estilos,68 objetos, clipping, zoom/desplazamiento, GPS conserva fuente, ausencia de snapping sobre cartel, descarga editable, símbolos compartidos, ficha/fallo de teselas/Detener GPS a320×568. Recursos404 o hash cambiado fallan sin perder23 recorridos ni OSM independiente.
- Cinco vistas/47 fichas, perfil/bicicleta/agenda/GPX/ICS; siete escenarios de consentimiento pendiente; ambos paquetes autónomos sin módulos/CDN externos; mapas/calibración/Blob antiguos con service worker conservados.
- GPS con posiciones públicas simuladas en ambos parques: señal, incertidumbre, rotación, parada y fallo de teselas.49 posiciones y cinco tamaños de teléfono; comparaciones nativas por seis sectores y capturas geográficas a390×844 con igual centro/zoom y teselas realmente cargadas. No se validó en terreno, teléfono físico ni pantalla bloqueada.
- **Prueba anterior pendiente:** `tests/parquemet-coverage-browser.mjs` falla en su primera aserción de rótulos móviles (`label lies in unobstructed mobile map`) tanto en v22 intacta como en el candidato. Hay un problema anterior de rótulos frente a cabecera/HUD. Esa suite no es verde y sus aserciones posteriores no se ejecutaron. Se conserva como pendiente separado; no se oculta el fallo ni se rediseña la interfaz como si resolviera geografía.
- Una ejecución GPS concurrente produjo un marcador transitoriamente sin caja tras rotar; la repetición aislada completa pasó. Se registra en la revisión independiente, sin presentarla como prueba de campo.

## Abrir y reproducir

Código fuente: ejecutar `npm run serve` desde el worktree y abrir `http://localhost:4173/docs/evidence/cartographic-fidelity/index.html`. Es una URL local, no una publicación ni un enlace accesible desde otro equipo por sí solo. Durante esta entrega también se comprobó la revisión en el servidor del entorno `http://127.0.0.1:4210/docs/evidence/cartographic-fidelity/index.html` y el paquete privado en4212. El ZIP entregado contiene ambos visores autónomos y esta comparación; no debe subirse al repositorio público porque conserva la fotografía privada autorizada.

Reproducción de fuentes/inventario:

```sh
python3 scripts/extract-cartel-context.py --pdf /ruta/al/Mapa_El-Durazno-2022_web.pdf --check
node scripts/audit-cartography.mjs
python3 scripts/build-cartography-review.py
node --test tests/cartography-artwork.test.mjs
```

No se publicaron nuevas versiones, cambiaron permisos, incorporaron servicios ni modificaron main. La corrección documental queda lista para revisar; la equivalencia geográfica completa sigue abierta y no debe anunciarse como terminada.
