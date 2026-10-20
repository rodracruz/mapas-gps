# Avenidas: vistas fieles del plano original, sin inventar centerlines

El [índice de vistas](../../data/parquemet/visual-avenues.json) conserva **diez recortes del JPG original** con los rótulos de las nueve avenidas ya catalogadas y Av. Gabriela Mistral. Cada vista aporta evidencia textual nativa del PDF y un `sourceRect` / `viewBox` revisado. Los rectángulos son encuadres de presentación, **no límites completos de una avenida**. `kind` es `document-crop`, `geometryStatus` es `not-extracted`, `routeGeometryAvailable` es `false` y `paths` está vacío.

## Fuente y plano de coordenadas

- PDF oficial retenido: [sources/parquemet-mapa-oficial.pdf](../../sources/parquemet-mapa-oficial.pdf), <https://mapas.parquemet.cl/doc/MapaParque.pdf>, **765376 bytes**, SHA-256 `e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8`.
- JPG original retenido: [sources/parquemet-mapa-oficial.jpg](../../sources/parquemet-mapa-oficial.jpg), **6690 × 2835**, **3251978 bytes**, SHA-256 `e0d91c5e90bbc290ae1af71d1b51e29960f682ab5dd242c3b24ede003f0a7dd3`. No se reescribe ni modifica.
- Página PDF: **6689.759765625 × 2834.64990234375 puntos**, rotación 0°. [official-document.json](../../data/parquemet/official-document.json) documenta el raster completo a 72 dpi y escala 1; el borde fraccionario se cubre con píxeles enteros sin estirar la página. La transformación de puntos superiores izquierdos a píxeles es `[1,0,0,1,0,0]`.

Los nuevos datos usan únicamente `document-pixels`, origen superior izquierdo y esa transformación identidad ya establecida. No existe registro aceptado con el mundo geográfico. `georeferencing.transform` y `crs` son `null`; navegación y distancias terrestres están deshabilitadas. La extracción no convierte puntos a GPS ni propone conexiones, recortes de vías geográficas o una condición operativa.

## Por qué no hay un vector individual por avenida

El PDF contiene **3540 dibujos nativos**. Su red principal de caminos blancos es el **dibujo 738**: un único objeto **relleno** de 600 operaciones, 547 cúbicas y 53 líneas, que abarca varios caminos con nombres diferentes. Sus bounds son `[1083.210205078125,609.3147583007812,3369.949951171875,874.7379760742188]`. El **dibujo 748** es otro relleno compuesto de la red blanca más amplia, con 1852 operaciones, 1418 cúbicas y 434 líneas; sus bounds son `[-50.740234375,-112.49609375,5978.712890625,2453.2529296875]`.

Estos objetos son bordes/superficies compuestos, **no centerlines separadas por nombre**. Descomponerlos por cercanía a un rótulo produciría una atribución y límites nuevos que la fuente no define. Los pequeños trazos blancos 732–747 incluyen ramales y rotondas locales; tampoco se adjudican por proximidad. `trails` permanece vacío. Los objetos 738/748 solo se registran como metadatos en `unassignedSourceDrawingGroups`, con `assignedToAvenue:false`, `centerlineAvailable:false` y hash del serializador nativo. El código reutiliza `path_record` de [extract-parquemet-cycling.py](../../scripts/extract-parquemet-cycling.py) únicamente para esa huella y para la comparación de QA, nunca como trazado de una avenida.

## Encuadres y evidencia textual revisada

Las letras sobre curvas se reparten entre bloques y spans de texto del PDF. El extractor conserva cada bloque seleccionado con texto, bounds e índice original y valida su concatenación exacta. No reconstruye los nombres desde OSM. Índices desde cero de `page.get_text('dict')['blocks']`; rectángulos en formato **x, y, ancho, alto**.

| ID | Rótulo literal de la fuente | Bloques PDF | Recorte original |
| --- | --- | --- | --- |
| `avenida-pedro-bannen` | `< Av. Pedro Bannen >` | 100–118 | 1690, 860, 500, 440 |
| `avenida-alberto-mackenna` | `Av. Alberto Mackenna »` | 36–37 | 1450, 550, 850, 650 |
| `avenida-abate-molina` | `< Av. Abate Molina >` | 71–85 | 2420, 1230, 340, 330 |
| `avenida-carlos-martner` | `< Av. Carlos Martner >` | 42–48 | 2400, 1060, 800, 500 |
| `avenida-carlos-reed` | `< Av. Carlos Reed >` | 31–35 | 1070, 1070, 1000, 480 |
| `avenida-claudio-gay` | `Av. Claudio Gay »` | 49–55 | 3000, 1290, 620, 350 |
| `avenida-federico-albert` | `« Av. Federico Albert` | 56–64 | 3080, 1080, 740, 410 |
| `avenida-manuel-zanartu` | `< Av. Manuel Zañartu >` | 65–66 | 3570, 1080, 980, 380 |
| `avenida-la-montana` | `< Av. La Montaña >` | 67–70 | 2280, 675, 1140, 510 |
| `avenida-gabriela-mistral` | `Av. Gabriela Mistral >` | 38–41 | 1980, 1120, 630, 260 |

Se inspeccionaron los diez encuadres sobre el original: incluyen su rótulo exacto y caminos blancos con contexto reconocible, sin colorear una curva atribuida. Los recortes pueden mostrar otros caminos o senderos del plano; no afirman que todo lo visible pertenezca a la avenida seleccionada.

## Nombres de la tabla y acceso exterior pendiente

**Av. Pablo Neruda** y **Camino Rafael Elizalde** tienen evidencia nominal en la tabla derecha. No se identificó en el mapa un rótulo vial que ubique sus respectivos trazados. Las referencias permanecen en `pendingSourceMentions` con `kind:'document-reference'`, `mapLocationStatus:'not-located-in-map'`, `routeGeometryAvailable:false` y sin `viewBox`. Una interfaz puede ofrecer el recorte de la tabla con su aviso explícito; no debe presentarlo como ubicación o miniatura de una ruta.

| ID | Evidencia literal | Bloque PDF | `referenceTableRect` |
| --- | --- | --- | --- |
| `avenida-pablo-neruda` | `por Av. M. Zañartu y Av. P. Neruda2,9 km` | 291 | 5820, 735, 750, 245 |
| `camino-rafael-elizalde` | `por Camino Rafael Elizalde170 m` | 345 | 5820, 480, 750, 245 |

El primer recorte conserva el encabezado **Acceso La Pirámide**, el destino **Mirador Los Gemelos** y la referencia 2,9 km por ambas avenidas. El segundo conserva **Acceso Pedro de Valdivia**, **Est. Teleférico Oasis** y 170 m por Camino Rafael Elizalde. Son referencias impresas del documento, sin fecha de operación confirmada; no son distancias calculadas de la geometría.

**Los Turistas** sí tiene rótulo nativo `< Los Turistas >` en el bloque 13, al norte del Acceso Zapadores, fuera del parque. Su recorte `[3160,360,330,440]` permanece en `pendingApproachViews`, `scope:'approach-outside-park'`, `assignedToTarget:false`. La referencia oficial de 240 m no permite delimitar sin inferencia las vías geográficas retenidas, por lo que no se activa un target ni se asignan todas las vías urbanas homónimas.

## Reproducción, pruebas e inspección visual

```sh
python3 scripts/extract-parquemet-avenues.py
python3 scripts/extract-parquemet-avenues.py --check --preview /workspace/scratch/parquemet-avenues/pdf/qa
node --test tests/parquemet-avenues-visual.test.mjs
```

Requiere PyMuPDF y Pillow. El extractor rechaza tanto un PDF alterado como un JPG distinto, valida el número de objetos nativos y los estilos/cantidades inspeccionados de los dos polígonos, y verifica que cada recorte contenga todos los fragmentos de su etiqueta. `--check` compara la regeneración byte a byte.

Se generaron e **inspeccionaron los once tripaneles** en `/workspace/scratch/parquemet-avenues/pdf/qa/`, uno por los diez IDs de la tabla anterior más `los-turistas`. Cada archivo `ID-comparison.png` muestra **JPG original / fragmentos textuales nativos delimitados / polígonos blancos nativos completos recortados, rotulados UNASSIGNED**. Se revisó la coincidencia de la red original, las etiquetas y el encuadre. El panel vectorial es evidencia de por qué el objeto compuesto no se atribuye a una avenida; no entra en los datos de rutas. También se inspeccionaron `avenida-pablo-neruda-table-reference.png` y `camino-rafael-elizalde-table-reference.png`. Los SVG de QA y los recortes PNG son temporales; el producto usa el JPG retenido sin modificar.

Las cuatro [pruebas específicas](../../tests/parquemet-avenues-visual.test.mjs) se observaron fallar por ausencia del dataset antes de la implementación y luego pasar. La separación de Los Turistas al estado pendiente tuvo también un fallo previo por su presencia entre las vistas activas y un pase posterior. Cubren hashes PDF/JPG, plano de coordenadas, nombres y fragmentos exactos, inclusión de etiquetas dentro de los recortes, ausencia de centerlines inventadas, referencias no ubicadas, acceso pendiente, regeneración byte a byte y rechazo de fuentes alteradas. Este trabajo acotado no ejecuta la suite global ni builds.

Hash canónico de contenido: `f54e01556669b25f3b236105cf566599b72c431cf1c746a5d8a1d1e6a51c76bb`. SHA-256 del JSON con sangría y salto final: `828f1e45b2d18ce35b0547b672f5cfa346c6541873f6c6f7eaa0b6ba4a12ea20`.
