# Publicación privada: seis rutas compartidas recuperadas

2026-10-20. Código `c87f415`, rama `fix/parquemet-shared-routes`, [PR #8 en borrador](https://github.com/rodracruz/mapas-gps/pull/8) sobre #7. Worktree `parquemet-coverage` conservado.

URL operativa comprobada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/parquemet#parque=parquemet . Versión14 `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_648436c9479c8191ba70fa441ca05f6b`, despliegue `appgdep_6ad7bf6a41f88191b2c2ba52fc5e6cbb`, `succeeded`. Fuente privada de hosting `963c1ef959def3000af1ae36e15f5bb453db6046`.

La audiencia sigue siendo privada para el propietario: un usuario, cero grupos/visitantes externos; HTTPS anónimo401. Credenciales de fuente y QA transmitidas sólo por stdin oculto/memoria de sesión, sin secretos en archivos o repositorio.

- Principal3.402.928bytes SHA256 `b441ab8f598832485ec61e9f6765fb085adc26cb71616e1900e812cdec38e6aa`.
- Parquemet1.266.173bytes SHA256 `c59436b64defafd7a2b04707822c4c8404f52b7be659cd0ce761dddbb07e43e9`.
- Ambas respuestas HTTPS coinciden con los bundles probados.
- ZIP privado `/downloads/mapas-gps-todos-senderos.zip`: HTTP200,12.538.131bytes SHA256 `a7303bfe77e2540ae1bd7d6ef17fbe69feb31abb2f1a0121e32f907fb31f19e4`, idéntico al archivo local. Incluye datasets editables nuevos y conserva la fuente OSM anterior. La foto privada sigue dentro del bundle privado; no subir este ZIP a Git público.
- Archivo de despliegue24.240.957bytes SHA256 `38e289de66a6bba32568d7cc81826b08ea0b33e5402f1e36795ac1e35b847525`.

Comprobación real en Chromium móvil390×844:24tarjetas de mapa/rutas/avenidas;14recortes originales de rutas Parquemet; ocho rótulos rojos y seis compartidos;90trazos geográficos atribuidos; selección de cada uno de los seis Paseos y comparación con su geometría nativa del plano. El visor oficial tiene14selecciones con fondo y curvas alineados. Se mantienen restricciones y distancias PDF/OSM separadas, ausencia de demo de otro parque y regreso a El Durazno sin mezclar datos. Cero errores JavaScript. [Recibo sin secretos](parquemet-shared/live-verification.json).

La misma regresión publicada verificó veinte fondos El Durazno, foto oficial y original privado intactos, revisión fotográfica anterior, demo pública y GPS mediante posiciones públicas emuladas por CDP. No es validación de terreno. Las pruebas locales incluyen109unitarias, nuevos contratos de seis recorridos en fuente/bundle,34fondos originales, integridad, gestos y nueve pruebas de aceptación con Blob/calibración/senderos/centro/localStorage conservados bajo service worker activo.

[Mapa publicado con14rutas](parquemet-shared/live-world14.png), [plano publicado](parquemet-shared/live-official14.png), [método, comparaciones y límites](parquemet-shared.md).

`main`/Pages permanecen en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`. El plano esquemático no se convierte en geometría GPS y las vías compartidas sin permiso explícito o restringidas no se usan para ajustar posición.
