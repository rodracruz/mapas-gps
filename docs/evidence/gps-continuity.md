# Continuidad de pista en el visor móvil

2026-10-20. Rama `feat/gps-route-continuity`, base `bf2c939`, worktree aislado `gps-continuity`. La aplicación anterior, IndexedDB, calibraciones y `main` no cambian.

## Comportamiento implementado

En Mapa de senderos, **Mi ubicación** inicia geolocalización nativa con permiso del navegador y cambia la fuente a OSM. No hay solicitud al abrir el parque. **Detener GPS**, cerrar el mapa, salir del parque o abandonar la página cancela el seguimiento y limpia la sesión. Los callbacks de sesiones anteriores se descartan.

El motor adquiere una pista con varias posiciones coherentes y mantiene su continuidad frente a pistas cercanas. Una transición requiere evidencia tras un nodo realmente compartido en los datos OSM; proximidad o cruce dibujado no bastan. Si varias lecturas fiables contradicen la hipótesis, se suspende el ajuste y se puede readquirir otra pista sin quedar fijado para siempre. «Probable» es una hipótesis heurística, no una probabilidad estadística calibrada. Precisión, antigüedad, rumbo y continuidad condicionan esa hipótesis. [Umbrales, fórmulas, fuente y pruebas del motor](gps-matcher.md).

El punto pequeño representa la lectura recibida y el aro hueco la posición ajustada; aunque coincidan, ambos siguen visibles. La precisión indicada por el dispositivo se dibuja como círculo. Una pérdida temporal de señal conserva el watch pero retira el ajuste; tras10 s sin lectura reciente la identificación caduca. Un rechazo de permiso detiene y limpia la sesión. No se usa el registro aproximado del cartel para ajustar el GPS. En Cartel sólo queda la lectura sin ajuste, con explicación visible.

**Probar recorrido** reproduce49 posiciones simuladas derivadas de geometría pública de Lomo Vetado→Calibre12, sin solicitar GPS. Incluye pausa, avance por lectura y progreso. [Fuentes y generación reproducible](gps-demo.md). Es una demostración del comportamiento del algoritmo, no una salida en bicicleta ni validación del sentido de circulación.

## Privacidad y transmisión del fondo

No se escriben posiciones/recorridos en localStorage, IndexedDB, archivos o Git ni se envían coordenadas/trazas a un backend de esta aplicación. Las posiciones sólo viven en memoria durante la sesión. El fondo de OpenStreetMap solicita teselas del área visible, también al centrar la ubicación: el proveedor puede deducir el área del mapa a partir de esas URLs. El aviso está visible antes de activar GPS y enlazado al botón mediante aria-describedby. Por eso no se afirma que el mapa no comunique ninguna información espacial. Las pruebas permiten únicamente lecturas estáticas de la app y URLs normales de teselas, sin parámetros con ubicación; no equivalen a auditar tráfico interno del servicio de geolocalización del navegador/SO.

## Verificación ejecutada

- `npm test`:80/80; incluye32 pruebas del motor y6 de demo. El ciclo RED se observó antes de implementar y en las regresiones corregidas.
- `node tests/gps-browser.mjs`: Chromium móvil390×844, API nativa del navegador con posiciones públicas emuladas por CDP. Comprueba opt-in, demo y transición por nodo4705609090, diferenciación lectura/ajuste, exclusión de Cartel, pérdida temporal de señal, caducidad, recuperación, rechazo de permiso, cierre, ausencia de persistencia/escrituras de red y ejecución del bundle standalone.
- `node tests/gps-layout-browser.mjs`:49 lecturas visibles y sin controles encima en390×844,844×390,320×740,667×375,320×568. Botón GPS de44 px accesible con ficha de sendero abierta; aro sin relleno. Capturas de las cinco disposiciones en `test-results/gps/` (ignoradas). Evidencia pública: [móvil](gps-continuity/demo-mobile.png), [horizontal](gps-continuity/demo-landscape.png), [ficha horizontal](gps-continuity/trail-sheet-landscape.png).
- Flujo móvil anterior9/9; aceptación geográfica9/9, incluida biblioteca anterior con SW activo/Blob/calibración/datos guardados; regresiones de atribución/encuadre/enlaces3/3.
- Cartel:3 pruebas unitarias y2 de navegador, conservando curvas, etiquetas, puntos, alineación y fallback explícito ante fuente corrupta.
- Revisión independiente del motor y UI. Se corrigieron: selección por rumbo que dependía de la división de vías OSM, detención incorrecta ante error temporal de señal, ocultación del punto original por el ajustado, y encuadre/solape en horizontal. Nuevas regresiones verifican los casos.

Se usó Chromium sin interfaz y emulación táctil/ubicación. **No** se probó un teléfono físico, GPS en movimiento real, calidad cartográfica sobre terreno, permisos propios del navegador incrustado del usuario ni comportamiento con pantalla apagada. No se implementaron navegación, accesos/sentidos, loops o distancia restante. OSM conserva fuente/fecha; una conexión en su base de datos no es garantía de acceso físico actual. El cartel continúa sin calibración GPS aceptada.

## Reproducir

```sh
npm ci
python3 -m http.server 4176 --bind 0.0.0.0
# En otra terminal:
npm test
python3 scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4176 npm run test:gps
GEOGRAPHIC_BASE_URL=http://127.0.0.1:4176 npm run test:gps:layout
```

Abrir `http://127.0.0.1:4176/mapa-geografico.html#parque=el-durazno&mapa=1` en la máquina que sirve el repositorio; es una URL local. El constructor funciona sin foto privada usando la fuente pública. `npm test` reconstruye `dist/` con fuente pública: generar de nuevo con `--reference-photo` sólo después de esa suite para conservar el adjunto en el alojamiento privado. Nunca añadir `dist/` al repositorio público.
