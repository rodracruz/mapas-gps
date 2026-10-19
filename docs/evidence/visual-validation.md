# Validación técnica de los trazados visibles

Fecha: 2026-10-18. Base de esta revisión: `9111b69`. La validación fue realizada por el desarrollador y una revisión independiente; no queda delegada al usuario.

## Resultado

Se contrastaron Starwars, La Virgen y Lomo Vetado directamente con la fotografía original, en recortes sin vectores y superposiciones ampliados por replicación de píxeles. La forma visible general es coherente con el cartel como digitalización aproximada. Se mantienen el recorrido exterior de Starwars, la exclusión de Cactus, los retornos y continuación occidental de La Virgen, y los giros de Lomo Vetado. No se añadieron conexiones transitables.

La revisión permitió **resolver una de las siete zonas** y ajustar un giro pequeño. Estado actual: **10 fragmentos / 253 vértices / 6 zonas pendientes**.

- **La Virgen:** la foto permite separar dos retornos sucesivos y los espacios claros entre ellos. El contorno aislado del PDF confirma el orden. El nuevo fragmento `la-virgen-s05` sigue esos giros; el ID histórico `virgen-tight-turns` pasa de `gaps` a `visualReviews` con estado `visually-resolved`. La explicación anterior de imposibilidad de separarlos era demasiado fuerte.
- **Lomo Vetado:** el pequeño gancho de `lomo-vetado-s02`, alrededor de (274–286, 625–635), alcanzaba un ápice unos 2 px más bajo que el visible. Parte de la desviación estaba ya en las muestras densas. Se ajustaron cuatro vértices existentes; se conserva el gancho y se elimina el pequeño retroceso. Era un ajuste dentro de la incertidumbre visual previa de 3 px, no un error demostrado mayor que esa cifra.
- **Conservación:** los otros ocho fragmentos y todos los extremos, nodos e IDs anteriores permanecen idénticos. Los seis recuadros restantes conservan sus bounds y procedencia. El fragmento nuevo tiene extremos visualmente coincidentes con sus vecinos, mediante nodos separados; `connections` y `geographicCorrespondences` siguen vacíos.

## Evidencia editable y comparación

- [La Virgen: fotografía / antes / después](visual-audit/virgen-tight-turns-antes-despues.png).
- [Lomo Vetado: fotografía / antes / después](visual-audit/lomo-hook-photo-review-antes-despues.png).
- [Manifiesto de imágenes](visual-audit/comparisons.json) y [mediciones](visual-audit/measurements.json).
- Observaciones editables: `data/el-durazno/visual-corrections.json`; fuente original fijada por SHA-256.

Las ampliaciones usan 8× por replicación ordinaria, sin generar detalle. Cinco observaciones de la foto comprueban el orden de los retornos verdes y una comprueba el ápice azul, con umbral local de **1,5 px**, acorde con líneas nativas de aproximadamente 2–3 px. Las distancias calculadas a esas observaciones son menores de 0,7 px, pero las observaciones son lecturas visuales aproximadas: **no acreditan precisión subpíxel ni un error máximo global de 1,5 px frente a la fotografía**.

La simplificación mantiene tolerancia RDP de 1 px frente a las muestras. Las muestras nuevas de los intervalos manuales son interpolaciones entre observaciones, identificadas como tales; comprobarlas no es una validación fotográfica independiente. Los cruces de color, centros de círculos y flechas tampoco quedan probados como puntos exactos ni conexiones.

## Reproducción y pruebas

`python3 scripts/apply-visual-corrections.py` aplica observaciones a la geometría predecesora fijada y permite reejecución idéntica. Rechaza una foto o revisión incompatible antes de escribir. La extracción completa `python3 scripts/trace-trails.py --pdf /ruta/al/PDF` prepara la extracción y las correcciones en un directorio temporal; publica los dos JSON únicamente tras completarlas. Un fallo del proceso corrector conserva ambos originales. Las dos escrituras finales no constituyen una transacción frente a un fallo de disco.

Se ejecutó la extracción completa con el PDF fijado por hash y se confirmó igualdad byte por byte de la geometría y las muestras actuales. Las regresiones por zigzag ausente y ápice desviado fallaron antes del ajuste y pasan después. La regresión de publicación reprodujo la pérdida de la revisión con el orden antiguo y pasa al preparar todo temporalmente.

Las 21 pruebas unitarias pasan; también las 12 comprobaciones del navegador, las de fuentes y las 5 de revisión de pendientes en escritorio y móvil emulado. El registro general y las verificaciones de la entrega y URL alojada se actualizan en [verification.md](verification.md).

## Qué sigue sin validar

Quedan cinco placas que ocultan el eje en la foto y el extremo inferior de Lomo Vetado. El PDF conserva contornos bajo algunas placas: es evidencia real de su dibujo, pero no demuestra por sí solo la identidad exacta de lo oculto en la foto. Se mantienen pendientes, sin interpolación.

Se volvieron a consultar las diez referencias OSM: sus versiones y coordenadas coinciden con el registro. Lomo Vetado sigue siendo la vía 477170097 v6, con 127 nodos. Se revisaron metadatos y diccionarios geográficos habituales del PDF sin encontrar una transformación geográfica declarada. El resultado es **cero pares píxel/geografía aceptados y ninguna transformación GPS validada**, no un ajuste de error nulo. Véase [verificación de fuentes geográficas](geographic-source-validation.json).

No se probaron teléfono físico, Safari, navegación GPS ni distancias de terreno. La validación visual permite continuar investigando geografía sin pedir al usuario que haga esta revisión técnica.
