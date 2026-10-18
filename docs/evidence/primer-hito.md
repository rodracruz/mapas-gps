# Mapas GPS — primer hito vectorial

## Alcance autorizado
Reconstruir únicamente lo visible de Starwars, La Virgen y Lomo Vetado; ofrecer comparación con foto, opacidad, capas, selección, zoom, pan y solo vectores. Investigar geografía por separado. No implementar navegación ni medir terreno desde el cartel.

## Estado inspeccionado
- Base: `87edc6c` (main, consultado 2026-10-18).
- No hay AGENTS.md, package.json ni suite previa.
- `visor-vectorial.html` contiene polilíneas aproximadas y conversión con dos referencias sin evidencia suficiente. No se reutiliza ninguna.
- `gps-real.html` presenta referencias y datos remotos; su presencia en código no valida la correspondencia.
- `app.js` guarda mapas en IndexedDB y usa `sample-installed` en localStorage. Esta entrega no cambia esos archivos ni el service worker.

## Fuente
`elh-durazno.jpg`, JPEG 900 × 1100 px, 453793 bytes, SHA-256 `c9fde34725691801933b3ba72f887a31677dba305d30f0f938f0ddf81211d018`. Sin EXIF. Origen exacto de la fotografía y fecha/edición del cartel no constan en el repositorio.

Sistema: origen (0,0) esquina superior izquierda, X derecha, Y abajo; unidades píxel de la imagen nativa. Transformación de imagen: identidad. No hay rectificación de perspectiva, CRS geográfico ni conversión a longitud/latitud.

## Decisiones de alcance
- La etiqueta azul del ramal superior interno dice Cactus; se excluye.
- Dos rótulos Starwars aparecen en el recorrido exterior azul del norte y oeste. Se conserva su continuidad visible, interrumpida por el rótulo del este y por el del oeste.
- La Virgen se identifica por su rótulo verde central. Se sigue además su continuidad visible al oeste hasta su segundo rótulo inferior; no se asignan las otras pistas verdes por color.
- Lomo Vetado se identifica por su rótulo azul diagonal. Su porción visible se separa a ambos lados del rótulo; el extremo inferior se detiene antes del icono/flecha, sin inferir una conexión.
- Los círculos dibujados y los encuentros de líneas son observaciones de imagen. No constituyen conexiones transitables comprobadas.

## Registro de ejecución
- Rama `feat/fiel-vector-review`, worktree `.worktrees/vector-review`.
- Decisión: al encontrar los contornos oficiales, sustituir el trazado manual por extracción asistida y centrado local. Reduce interpretaciones; no establece identidad de edición ni precisión geográfica.
- El directorio de worktrees está excluido localmente en `.git/info/exclude`; no fue necesario modificar main.
- Plan breve autorizado por el usuario; ejecución continua sin otra aprobación.
- Preflight: los datos y SVG comparten el sistema `image-pixels`. El módulo matemático no conoce latitud ni longitud; geografía usa archivo separado.

## Fuente oficial y reconstrucción

Se encontró una versión de mejor calidad enlazada por [Outlife](https://www.outlife.cl/parques/rkf-el-durazno/): JPG 2570 × 3077 y PDF con contornos vectoriales. Se descartó para esta reconstrucción una edición anterior con diferencias de color y contenido. El cotejo de los tres recorridos y su entorno es compatible con la foto, pero la fecha de la foto no permite afirmar identidad de edición del cartel completo.

La copia JPG oficial está conservada en `sources/`. El PDF de 82,6 MB permanece como descarga de investigación y no se añade al repositorio. URL y SHA-256 están en el [registro de fuentes](geographic-references.md). Su hash se verifica al reproducir el trazado.

El método final aprovecha los contornos oficiales como guía visual; evita volver a interpretar curvas mediante unos pocos puntos manuales:

1. Registrar el JPG oficial sobre la fotografía con SIFT y homografía RANSAC. Se filtraron coincidencias fuera del área de mapa y a más de 50 px de una colocación aproximada `(p−[578,80])/2.2`, evitando falsos emparejamientos de la textura repetida. Hay 102 candidatos y 90 inliers.
2. Extraer exclusivamente los contornos de Starwars (índice 51), La Virgen (31) y Lomo Vetado (39) del PDF fijado por hash. Los índices son identificadores de extracción para esos bytes, no IDs geográficos.
3. Rasterizar los contornos a 4 píxeles por punto PDF y proyectarlos al sistema de foto a 3 muestras por píxel; adelgazar y ordenar la línea central entre extremos visuales. Pequeñas espículas del adelgazamiento no se convierten en ramas de red. El área de zigzags verdes con solapamiento del grosor se deja pendiente.
4. Excluir primero los intervalos dentro de los recuadros pendientes. Cada intervalo restante genera un fragmento separado; nunca se unen componentes desconectados.
5. Centrar localmente cada fragmento sobre la línea de color de la foto mediante búsqueda normal limitada a ±3 px, suavizada para reducir ruido JPEG. Se conserva la topología de la guía y no se buscan caminos alternativos.
6. Simplificar con Ramer–Douglas–Peucker, tolerancia **1 píxel nativo**; redondear a centésimas. La prueba compara todos los puntos densos contra el resultado y admite solo 0,008 px adicionales por redondeo.

La tolerancia de 1 px es menor que el grosor habitual de 2–3 px de las líneas de esta foto y permite conservar los giros visibles sin convertir cada artefacto JPEG en un vértice. **No es una garantía de exactitud del terreno**, ni un error máximo demostrado frente a una línea central física. El centrado local está limitado a 3 px; las zonas donde no permite resolver el eje se marcan pendientes. La simplificación se mide contra las muestras densas guardadas en `centerline-samples.json`, no contra una verdad geográfica.

### Transformación entre imágenes

`image-registration.json` guarda todas las correspondencias y la homografía. Convención: columna `[x,y,1]` en píxeles del JPG oficial; multiplicar y dividir por la tercera componente para obtener píxeles de la foto.

```text
[ 0.473449517640   0.009091352459  -279.815862289267 ]
[ 0.013193660826   0.480202296092   -63.980437042541 ]
[ 0.000011865185   0.000013166856     1.000000000000 ]
```

La foto original NO se rectifica: transformación identidad. Esta homografía solo coloca una fuente gráfica en el sistema de otra imagen. Los vectores finales ya están en píxeles nativos de la foto, y no requieren transformar la imagen durante el zoom.

Comprobación interna 45/45 de las coincidencias seleccionadas: RMSE 1,0002 px, máximo 2,1439 px. La selección de inliers usó el conjunto completo antes de dividirlo: **no es una validación independiente** y no debe presentarse como precisión acreditada. Se revisaron además capturas de foto/superposición/vectores para los tres senderos. Esto no proporciona ninguna prueba GPS.

### Geometría resultante

9 fragmentos, 245 vértices, 18 extremos visuales separados y 7 zonas pendientes. Starwars: 3 fragmentos, La Virgen: 4, Lomo Vetado: 2. La Virgen incluye la continuación verde al oeste y su segundo rótulo inferior; no se confunde con Parcero/Papaya.

El JSON contiene `nodes`, `segments`, `sources`, `connections: []` y `geographicCorrespondences: []`. Los extremos pertenecen a cada fragmento y no se fusionan por proximidad. Las conexiones transitables no están comprobadas. Los recuadros de incertidumbre no contienen geometría de enlace. Lomo Vetado tiene color violeta en el visor para distinguirlo de Starwars; ese color de revisión no modifica su identificación azul en el cartel.

## Reproducir

El visor no necesita instalar dependencias de aplicación. Servir el repositorio con `python3 -m http.server 4173` y abrir `http://127.0.0.1:4173/revision.html`.

Para generar el HTML autónomo: `python3 scripts/build-standalone.py`. Incluye la foto original, los trazados y la documentación. Los enlaces al mapa oficial y a la app publicada son externos; el visor central no los necesita para funcionar.

Para volver a calcular la geometría (herramientas de análisis opcionales): instalar `scripts/requirements-tracing.txt`; descargar el PDF oficial indicado en el registro de fuentes y ejecutar `python scripts/trace-trails.py --pdf /ruta/al/mapa.pdf`. El script verifica su SHA-256. Para recalcular solo el registro visual: `python scripts/register-images.py --output /ruta/de/salida`; revisar el nuevo ajuste antes de sustituir el registro guardado.

Los IDs actuales se preservan al editar las listas de puntos. Si se divide un fragmento en una revisión futura, mantener el ID histórico y registrar sucesores; no renumerar globalmente para asociarlos a OSM.

## Pendiente para el siguiente hito

Resolver las siete zonas señaladas mediante mayor evidencia de la misma edición; aceptar visualmente los recorridos; establecer correspondencias geográficas inequívocas y controles de comprobación independientes. Solo después decidir modelo geográfico y topología navegable. No se usan longitudes del cartel como distancias de terreno.
