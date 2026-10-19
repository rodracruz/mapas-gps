# Cartel sobre mapa mundial: registro experimental

Fecha de evaluación: 19-10-2026 UTC. Consulta OSM retenida: 19-10-2026 UTC (18-10-2026, America/Santiago). Este documento registra un ajuste de presentación y sus desacuerdos. **No acredita precisión GPS ni habilita navegación.**

El usuario solicitó conservar las curvas y los rótulos del cartel en el mapa mundial. La capa utiliza el arte original del PDF oficial de Outlife, identificado como mapa 2022, en coordenadas de imagen 2570 × 3077. El original de la fotografía y el arte fuente se conservan. La edición exacta de la fotografía del usuario frente al PDF todavía no está demostrada.

## Fuentes y asociaciones

- Dibujo: [PDF del operador](https://www.outlife.cl/wp-content/uploads/2023/04/Mapa_El-Durazno-2022_web.pdf); ejes y símbolos en `data/el-durazno/continuous-sign-trails.json`. No contiene geografía publicada ni puntos de control geográficos.
- Geografía candidata: instantánea OSM `sources/el-durazno-osm.json`, SHA-256 `b8926fb02ddcc2410850d831312e64a5c51e5aeb9db49ce970a86e418a0df318`, obtenida de [API OSM](https://api.openstreetmap.org/api/0.6/map?bbox=-70.518,-33.328,-70.485,-33.290). Los identificadores exactos de las trece vías nominales están en el registro generado y en `geographic-catalog.json`. No se extrae geometría de Trailforks o Google.
- La asociación se limita a diez nombres presentes tanto en el cartel como en OSM. Conserva incluso las grafías literales OSM, como `Ssendero Los Saltos`. Subida Buitrera no se equipara automáticamente al dibujo «Subida».

## Modelo elegido

Se estima una semejanza con cambio explícito del eje vertical de imagen. Entrenan solamente Lomo Vetado, Papaya y Calibre 12. Las otras siete rutas nominales quedan fuera del cálculo. La optimización ICP simétrica busca puntos cercanos **dentro del mismo nombre**, con peso inicial igual por ruta y dirección y una pérdida robusta. Los centroides sólo inicializan el cálculo; no se registran como puntos geográficos de control. Se muestrean las líneas a 2 píxeles y las vías a 2,4 metros de Mercator para comparar formas. El umbral robusto de 24 metros de Mercator controla el estimador; no representa precisión, tolerancia de vectorización ni radio de ajuste GPS.

También se calcula un afín. Añadir sus grados de libertad no mejora la transferencia a XL y Rock N’Roll, alejados del grupo de ajuste; por eso se conserva como comparación y se elige la semejanza. No se deforma cada sendero para forzar que coincida con OSM. Las curvas y su relación espacial original permanecen juntas como una sola capa.

El registro mantiene `acceptedTransform: null`, `transform: null`, `validated: false` y `validation.status: unvalidated`. `experimentalModel.matrix` se permite únicamente para la presentación aproximada explícita del arte sobre el mapa mundial. No se utiliza para ajuste GPS, conexiones, distancias de terreno, accesos ni sentidos.

## Convención de la matriz

`experimentalModel.matrix = [a, b, c, d, e, f]` sigue la convención SVG:

```text
X = a * imageX + c * imageY + e
Y = b * imageX + d * imageY + f
```

La entrada usa píxeles nativos: X hacia la derecha, Y hacia abajo. La salida usa EPSG:3857 en metros: X hacia el este, Y hacia el norte. Mercator no tiene el mismo eje Y que los píxeles de Leaflet. Para un visor debe aplicarse la matriz y desproyectar EPSG:3857 antes de proyectar al mapa, o componerse ambas transformaciones completas.

Las métricas siguientes desproyectan Mercator y convierten a un marco local este/norte sobre WGS84 con origen −70,5°, −33,31°. Evitan llamar «metros de terreno» a los metros de Mercator.

## Comprobación de formas fuera del ajuste

Son distancias al punto más cercano de la curva con el mismo nombre, no errores contra referencias de terreno independientes. Una curva próxima o paralela puede dar un residuo pequeño sin que el punto corresponda. Los valores de las rutas de ajuste son especialmente optimistas. Las rutas excluidas no intervienen en el modelo, pero proceden de la misma familia OSM y no sustituyen verificaciones independientes de campo.

| Sendero | Papel | Cartel → OSM: mediana / p95 (m) | OSM → cartel: mediana / p95 (m) |
|---|---|---:|---:|
| papaya | ajuste | 4.7 / 17.5 | 5.2 / 18.5 |
| parcero | excluida del ajuste | 3.0 / 10.2 | 3.6 / 21.0 |
| mampato | excluida del ajuste | 7.1 / 24.5 | 9.5 / 53.5 |
| lomo-vetado | ajuste | 6.4 / 29.2 | 6.2 / 26.9 |
| la-bala | excluida del ajuste | 9.1 / 38.0 | 11.7 / 35.8 |
| cebolla | excluida del ajuste | 3.8 / 13.1 | 4.2 / 14.6 |
| los-saltos | excluida del ajuste | 1.3 / 5.4 | 4.2 / 116.9 |
| xl | excluida del ajuste | 19.7 / 39.7 | 25.4 / 619.3 |
| rock-n-roll | excluida del ajuste | 18.0 / 25.2 | 20.1 / 245.7 |
| calibre-12 | ajuste | 6.1 / 17.5 | 5.8 / 16.0 |

XL, Rock N’Roll y Los Saltos presentan una asimetría marcada: la vía nominal OSM continúa más allá de la porción que coincide con el cartel. No se borra esta discrepancia recortando los datos para obtener mejores resultados. Por eso la capa OSM se conserva aparte y el cartel permanece marcado como aproximado. La zona norte, sin referencias nominales de validación, es extrapolación.

## Extremos candidatos, no controles aceptados

El JSON incluye diez hipótesis entre centros de puntos del PDF y extremos nominales OSM, con coordenadas, identificadores, URL, fecha y diferencia resultante. No se utilizan para ajustar. No se han comprobado como lugares reales inequívocos y no deben convertirse en controles aceptados por aparecer en el archivo. Sus diferencias no son una estimación de precisión.

Un ejemplo material impide afirmar una coincidencia exacta: los puntos inferiores de Lomo Vetado (`[1214.56054,1605.57163]`) y Calibre 12 (`[1243.32234,1616.35474]`) están separados en el arte unos 30,7 píxeles. Las dos vías OSM terminan en el mismo nodo 4705608441. El modelo aproxima esos puntos a posiciones separadas unos 46 metros. Esto puede reflejar diseño del cartel, límites nominales o distinta fecha. No se inventa una conexión entre ellos y tampoco se fusionan gráficamente para ocultarlo.

## Reproducción y límites

```sh
python3 scripts/fit-cartel-registration.py
```

El script usa sólo los tres archivos locales identificados por SHA-256 en el JSON. No consulta servicios. Depende de NumPy y SciPy, ya fijados en `scripts/requirements-tracing.txt`. El resultado incluye las dos matrices candidatas, las métricas por ruta y las hipótesis de extremos. No produce GeoJSON ni modifica los senderos, la instantánea OSM o los datos del usuario.

No hay puntos de comprobación geográficos independientes aceptados. La coincidencia visual general permite una capa de referencia aproximada claramente identificada; no permite presentar las curvas como ubicación exacta, calcular navegación sobre ellas ni mostrar una precisión en metros. Para aceptar georreferenciación se necesitan referencias inequívocas y comprobaciones independientes distribuidas por la red, con revisión de diferencias de edición, límites de senderos y deformaciones del cartel.
