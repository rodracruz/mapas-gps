# Resolución del hallazgo de revisión

La revisión independiente encontró un fallo P2: una rejilla de10px podía omitir un hueco válido entre banner y GPS y ocultar Anfiteatro seleccionado. El informe original se conserva en `final-review.md`.

Se reprodujo el caso antes de corregirlo en `label-layout.test.mjs` con una franja libre entre y123,78125 y166. La prueba falló porque devolvía `null`. La búsqueda incorpora ahora posiciones exactas junto a los bordes de todos los obstáculos y rótulos ya colocados, además de la rejilla. La prueba pasa y la comprobación real de navegador exige que el rótulo Anfiteatro siga visible después de tocar su propio texto para abrir la ficha.

Después de este ajuste se ejecutaron **160/160 pruebas unitarias** y **12 suites de navegador completas**, sin fallos: rótulos/cobertura en fuente, GPS seguimiento,49 posiciones/cinco tamaños, filtros, cinco vistas/47 fichas, almacenamiento antiguo, consentimiento, fidelidad cartográfica, paquetes autónomos y rótulos/cobertura en el paquete final. Las suites se ejecutaron secuencialmente para evitar la contención observada anteriormente. Logs en `regressions/`, `full-suite.log` y `private-build.log`.

La revisión también comprobó independientemente que cambios de tamaño/aviso sólo recolocan textos y llamadas: cámara, transformaciones de anclajes y paths de las rutas permanecen idénticos durante esa actualización. No se solicitó GPS al abrir. El primer encuadre sí reserva ahora el banner/HUD real; por eso puede diferir del encuadre incorrecto de v22. Ningún dato geográfico se modificó.

El hallazgo P2 queda resuelto por reproducción RED→GREEN y verificación posterior. No se publicó el candidato ni se aceptaron controles geográficos nuevos.
