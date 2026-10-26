# bikeride · Cinco vistas ciclistas

Integración de las cinco pantallas aprobadas del segundo ZIP: mapa GPS en ruta, explorador, detalle técnico, perfil/actividad/garaje y encuentros. Expediciones y alquileres quedan fuera. La publicación exacta y sus hashes se registran en `release.json` al completar el despliegue privado.

## Qué funciona

- Los 21 recorridos de El Durazno y los 26 de Parquemet, con búsqueda, filtros, favoritos y planos originales. Longitudes OSM y PDF se mantienen separadas; un plano general o una referencia de tabla no se presenta como un trazado individual.
- Perfil local opcional, bicicletas con valores introducidos por el usuario, historial de actividades y archivos GPX guardados. Crear, editar y eliminar utiliza IndexedDB independiente de los mapas antiguos.
- Agenda personal con edición, cancelación/reactivación y archivos ICS reales. No hay participantes, reservas ni eventos compartidos.
- Registro GPS voluntario, pausa, reanudación, cierre e interrupción al salir; recuperación de datos ya confirmados tras recargar. Consulta y demostración no crean actividades. Los segmentos rechazados o interrumpidos no se unen.
- Exportación GPX de geometrías geográficas documentadas, conservando segmentos y atribución OSM; las actividades propias no se atribuyen a OSM. Un GPX no descarga el mapa base.

## Evidencia

Las diez capturas `*-390x844.png` muestran los cinco estados iniciales de cada parque. `garage-fixture-390x844.png` y `agenda-fixture-390x844.png` utilizan exclusivamente datos sintéticos en un contexto nuevo; no son datos personales ni valores iniciales del producto.

La comparación con los PNG originales se conserva únicamente en el sitio privado: `comparacion-vistas.html`. Las dos columnas usan 390px de anchura y una ventana de 844px. El ZIP no documenta el viewport CSS ni el DPR de origen: la comparación permite revisar composición y jerarquía, pero no acredita igualdad píxel a píxel. Marca, planos, datos comprobados y estados vacíos sustituyen las personas y cifras ficticias de Stitch.

`verification.json` registra el código y los resultados de la verificación final. Las revisiones independientes y decisiones de ejecución se conservan en `reviews/` y `decisiones.md`.

## Comprobaciones

La batería final se ejecuta en una copia aislada y la construcción privada incorpora la fotografía original sin cambiarla. Se comprueban las dos salidas autónomas, formularios/persistencia/rollback, archivos descargados, hashes y navegación repetida. La regresión GPS incluye 49 posiciones públicas, precisión, antigüedad, continuidad, permiso rechazado, giro de pantalla y controles visibles. La comprobación de preservación conserva Blob, calibración y senderos con service worker activo.

Las correcciones de revisión verifican visibilidad de pausa/cierre/errores, contraste de fecha y descripción accesible real en ambos parques a 320×568 y 390×844. La tarjeta del plano mantiene el diseño ya publicado: se corrigió una flecha que interceptaba el toque sobre la imagen. Se prueban foto, ampliación y zoom con toques normales, sin clics forzados.

## Límites

GPS probado con posiciones simuladas del navegador y referencias públicas, no en terreno ni en un teléfono físico. No se garantiza grabación con pantalla bloqueada o recuperación de datos aún no confirmados antes de un cierre abrupto. Los registros son locales, sin cuenta ni sincronización.

Beacon/SOS, encuentros colaborativos, servicios en tiempo real, cartografía offline completa y satélite/3D necesitan servicios, fuentes o decisiones adicionales. Altimetría, obstáculos, patrulla, clima, accesos y sentidos no se inventan. La red todavía no acredita indicaciones de giro, loops o distancias restantes por caminos.

## Reproducir

```sh
npm test
npm run build:geographic
node tests/rider-views-browser.mjs
node tests/rider-lifecycle-browser.mjs
node tests/rider-review-browser.mjs
node tests/rider-bundle-browser.mjs
```

Los browser tests necesitan el servidor estático indicado por sus variables de entorno. Para la variante privada:

```sh
python3 scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg
```

No ejecutar estos builds sobre una `dist` privada que deba conservarse: usar una copia aislada. La foto y los ZIP originales permanecen fuera del repositorio público. Código en `feat/bikeride-stitch-integration`; GitHub `main` se conserva.
