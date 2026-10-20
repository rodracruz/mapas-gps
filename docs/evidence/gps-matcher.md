# Motor de identificación probable con continuidad

Implementación experimental en `navigation/matcher.mjs`, sobre la base `bf2c939`. No supone validación GPS de campo, precisión garantizada, acceso permitido ni sentido de circulación. Identifica una hipótesis de pista; no calcula itinerarios, giros, bucles o distancias restantes.

## Fuente y topología

Sólo admite `FeatureCollection` con `metadata.source = OpenStreetMap`, `coordinateSystem = EPSG:4326` y `coordinateOrder = longitude,latitude`. Rechaza registros visuales no nulos, píxeles, coordenadas fuera de rango, vías sin aristas útiles y nodos ausentes o inválidos. Las coordenadas repetidas de un mismo ID de nodo deben coincidir dentro de 5 cm; esa tolerancia sólo comprueba coherencia del dato y nunca crea conexiones.

Conserva todas las aristas consecutivas de cada vía, copiadas de la fuente. Sólo los IDs de nodos OSM compartidos permiten conectar vías. Cruces dibujados, nombres iguales, proximidad de líneas y el registro del cartel no crean topología. Las vías del mismo `targetId` pertenecen a un componente de continuidad sólo si están conectadas por nodos compartidos. Dos partes desconectadas siguen siendo hipótesis distintas aunque tengan el mismo nombre e ID de ruta público.

La identidad pública es `targetId` cuando existe; en caso contrario es `feature.id`. Un contexto sin nombre se presenta como «Camino OSM sin nombre» y mantiene `source: OpenStreetMap`. No se asignan nombres del catálogo por cercanía ni se interpreta el atributo de acceso o sentido de las vías.

## Contrato

```js
const matcher = createRouteMatcher(geographicData, options);
matcher.update({longitude, latitude, accuracy, timestamp, heading: null, speed: null}, now);
matcher.snapshot(now);
matcher.reset();
```

`timestamp` y `now` son milisegundos Unix; las posiciones son longitud/latitud, la precisión es en metros, la dirección en grados y la velocidad en m/s. Omitir `now` usa `Date.now()`; los tests y la demo pasan el reloj explícitamente.

Cada resultado contiene `status`, `route`, `candidates`, `raw`, `snapped`, `junction`, `reason` y `continuity`. Sólo `probable` contiene `snapped`. Se conserva por separado la lectura real aceptada, sin moverla ni reemplazar su incertidumbre. Una lectura inválida, futura o repetida devuelve un resultado transitorio sin punto ajustado; no sustituye la lectura aceptada ni altera la memoria de adquisición. `snapshot` puede caducar el estado sin recibir nuevas lecturas. `reset` elimina toda la memoria de sesión.

Los resultados y la fuente se copian para impedir que una modificación externa altere el motor. Sólo hay memoria de la última observación y de la hipótesis; no hay almacenamiento, historial de posiciones, red, geolocalización ni dependencias del DOM.

## Heurísticas predeterminadas

Son tolerancias de esta identificación experimental, configurables mediante `options`, sin porcentaje de confianza inventado.

| Opción | Valor | Uso |
| --- | ---: | --- |
| `acquisitionFixes` | 3 | Lecturas coherentes para adquirir una hipótesis |
| `transitionFixes` | 3 | Lecturas favorables a la salida de una intersección |
| `escapeFixes` | 3 | Lecturas buenas que excluyen la hipótesis retenida |
| `minSpanMs` | 2000 | Duración mínima de esas evidencias; una ráfaga no basta |
| `maxAccuracyM` | 45 | Por encima se retira el ajuste y se exige readquisición |
| `escapeAccuracyM` | 15 | Precisión máxima para invalidar una hipótesis fuera de intersección |
| `staleAfterMs` | 10000 | Edad o interrupción que retira el ajuste y la continuidad |
| `maxFutureMs` | 2000 | Tolerancia de desfase de reloj; más adelanto se rechaza |
| `junctionRadiusM` | 25 | Radio para observar una intersección real |
| `junctionExitRadiusM` | 90 | Distancia máxima de la evidencia de salida a ese nodo |
| `junctionWindowMs` | 12000 | Tiempo máximo desde el último encuentro con el nodo |
| `maxSpeedMps` | 35 | Límite de movimiento usado para detectar saltos de posición |
| `motionSlackM` | 20 | Holgura de movimiento, además de ambas precisiones |
| `headingMinSpeedMps` | 1.5 | Velocidad mínima para considerar dirección |
| `headingMaxSpeedMps` | 25 | Velocidad máxima para considerar dirección |
| `headingMaxAccuracyM` | 15 | Precisión máxima para considerar dirección |
| `headingPenaltyM` | 18 | Peso máximo de incompatibilidad angular en la adquisición |

La proyección se realiza por segmento con una aproximación tangente local en metros, recalculada en la latitud de cada lectura. Es apropiada para la extensión local de este snapshot; no es un motor geodésico global. La comparación de distancias entre posiciones y nodos usa la distancia de gran círculo con radio terrestre 6 371 008,8 m.

Para adquirir, la distancia máxima es `max(12, min(60, accuracy × 1.25))` m. Primero se conserva la proyección de distancia física mínima de cada componente, examinando todas sus aristas con independencia de cómo estén repartidas entre vías OSM. El rumbo no puede sustituirla por una proyección más lejana y dejar fuera del radio una pista que pasa bajo el GPS; sólo desempata proyecciones a la misma distancia exacta dentro del componente. Después puede penalizar la incompatibilidad angular para comparar hipótesis distintas, sólo si la velocidad y la precisión están dentro de los límites de la tabla. Una diferencia entre puntuaciones de candidatos de hasta `max(5, accuracy × 0.9)` m mantiene ambigüedad. La dirección se compara en ambos sentidos de la arista, sin interpretar permiso de circulación. Es una ayuda heurística, no una garantía de que el rumbo reportado sea correcto.

La hipótesis retenida tolera una distancia de `max(15, min(65, accuracy × 2 + 5))` m. Mientras siga siendo compatible, una paralela más cercana no la sustituye. Cerca de un nodo realmente compartido se permite reconsiderar únicamente componentes incidentes en ese nodo y se exige ventaja y evidencia temporal de la salida. Una muestra aislada de giro no cambia la pista. La ventana de salida permite confirmar el cambio después de abandonar el radio inmediato del nodo.

Fuera de ese caso, tres o más lecturas con precisión de hasta 15 m, incompatibles durante al menos dos segundos, permiten abandonar la hipótesis. La pista alternativa sólo pasa a probable si reúne a su vez la evidencia de adquisición; el resultado se marca `reacquiring`, nunca `junction-transition` por proximidad o cruce gráfico.

Un desplazamiento entre observaciones superior a `35 × segundos + 20 + precisiónAnterior + precisiónActual` metros se trata como salto: se muestra la posición real sin ajuste, se descarta la continuidad y la siguiente lectura comienza una adquisición nueva. Una interrupción de más de diez segundos también descarta la continuidad, aunque el nuevo punto vuelva a la misma pista. La precisión peor de 45 m y una lectura antigua retiran el ajuste y exigen readquisición. Las lecturas débiles no acumulan evidencia para escapar de una pista retenida.

## Verificación realizada el 2026-10-20

TDD: primero se escribieron 26 pruebas conductuales; la ejecución fue roja con la API ausente. Después se implementó el motor y se corrigió una cadencia sintética que implicaba un salto de 65 m en un segundo. Se añadieron tres regresiones para ráfagas de lecturas: las tres fallaron por adquirir, cambiar o abandonar prematuramente; se introdujo `minSpanMs` y pasaron.

La revisión independiente reprodujo un defecto al colapsar las vías de un componente por puntuación de rumbo: una arista bajo el GPS era reemplazada por otra a 13 m y el resultado podía ser «fuera de ruta» sólo por dividir la misma geometría en dos vías. Se añadieron tres regresiones y se observaron sus fallos antes del cambio: adquisición del mismo recorrido dividido/sin dividir y con orden de vías inverso, desempate de aristas igualmente cercanas independiente de la partición, y conservación de una hipótesis ya retenida ante un cambio de rumbo con otra arista del componente a 17 m. La selección física mínima por componente corrigió esos casos; los umbrales y el fixture de demo no cambiaron. La revisión posterior confirmó el arreglo y 38/38 pruebas conjuntas de motor y demo.

- `node --test tests/navigation-matcher.test.mjs`: 32 pruebas, 32 correctas.
- `node --test tests/navigation-matcher.test.mjs tests/navigation-demo.test.mjs`: 38 pruebas, 38 correctas.
- `npm test`: 80 pruebas, 80 correctas en la ejecución que incluía el motor y la demo; sin fallos.
- `git diff --check`: sin errores.

Las pruebas ejercitan adquisición, proyección métrica, ambigüedad inicial, retención frente a paralelas, cambio confirmado por nodo compartido, una muestra de giro, escape sin intersección, cruces gráficos sin conexión, partes desconectadas con el mismo target, continuidad entre partes realmente conectadas, vías sin nombre, caducidad por reloj e interrupción, lecturas antiguas/futuras/repetidas, mala precisión, saltos, dirección bidireccional con señal adecuada, coordenadas inválidas, reinicio, ausencia de geometría cercana, protección de mutaciones y defensas de procedencia/topología.

También se carga con `fromOsmSnapshot` el snapshot completo de 79 vías y se adquiere Lomo Vetado con sus coordenadas originales, sin mutarlas. Como comprobación de integración independiente se reprodujeron las 49 posiciones de `createPublicDemo`: índice 2 adquiere Lomo Vetado; índice 26 cambia a Calibre 12 mediante `junction-transition` en el nodo OSM 4705609090; índice 27 y posteriores conservan Calibre 12. El motor y sus umbrales no se modificaron para forzar ese resultado. Esta reproducción es una señal simulada sobre datos públicos, no una prueba de campo.

## Límites prácticos

Las paralelas que la incertidumbre no separa permanecen ambiguas si no existe una hipótesis previa. Una hipótesis previa compatible puede conservarse aunque sea errónea hasta disponer de evidencia que la excluya; éste es el compromiso explícito de la continuidad. Si falta un nodo compartido en el snapshot, el motor no inventa la intersección: puede perder la hipótesis y readquirir posteriormente. Una topología OSM conectada no demuestra transitabilidad, acceso, sentido permitido ni estado real del sendero. Los umbrales requieren evaluación posterior con señal real consentida y revisión de campo antes de afirmar precisión de navegación.
