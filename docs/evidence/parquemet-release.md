# Parquemet: publicación privada comprobada

2026-10-20. Sitio real https://mapas-gps-revision-durazno.rodracruz.chatgpt.site. Entrada directa comprobada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/parquemet#parque=parquemet. No son URLs locales ni una publicación sobre GitHub Pages.

- Código funcional3c22980, rama `feat/parquemet-second-park`;3c6fc57 marca PDFs como binarios para preservar bytes originales. [PR #5 en borrador](https://github.com/rodracruz/mapas-gps/pull/5), base `feat/gps-route-continuity`.
- Fuente de alojamiento `300aaf326d72a51f1b749b6572d966294360c756`, empaquetada con la misma identidad del sitio y audiencia anterior.
- Deployment `appgdep_6ad78864dfd48191bd6cb6a8ce579b6f`, `succeeded`, terminado2026-10-20T15:28:00.210109Z.
- Versión11: `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_6b83df49a0ac81919ed0fd7b7528b987`.
- HTML principal3.392.813bytes SHA256 `4fde4664cf17c4c9e701bbc9956f18bb72c3d2ca3b9d5281c753ccac51e1bb05`; Parquemet634.564bytes SHA256 `d7c5fae6f2c57db32a5a2f5a6276aed2aeb9323caa67ff2fe85da8e73dc4f998`. Ambos coinciden entre build y respuesta HTTPS.
- ZIP privado actualizado `/downloads/mapas-gps-todos-senderos.zip`:12.328.861bytes, SHA256 `2bdf5e4a6ded3f5828805fc6ab0002320a0f66d87f4b203ddc1dea9938d6a3aa`, respuesta autorizada200 idéntica al archivo local. Contiene ambos parques, los originales públicos y la foto privada previa de El Durazno; no subirlo al repositorio público.
- Archivo de despliegue23.933.676bytes, SHA256 `f6d61f1e015cb941ceee088ace1ecb5cb3796e3b0cf56c999f38b114e1e5bc91`.

Verificación independiente sobre HTTPS con Chromium390×844: acceso anónimo401 y propietario sin ampliar audiencia; selector con2parques; ocho fichas ciclistas+dosavenidas de Parquemet; imagen oficial6690px; zoom, recorte inicial y recuperación de panorama;31 vías nominales OSM dibujadas; fondo con teselas reales, selección/ficha, distanciaPDF900m yOSM609m diferenciadas en Centenario; Pa’ arriba pendiente y sin demo ajena; vuelta a El Durazno sin fichas mezcladas. El Durazno conserva su imagen2570×3077, foto original960×1280,23 curvas/29rótulos/45puntos, comparaciónOSM13vías, visor fotográfico anterior y demoGPS. API de ubicación nativa probada por HTTPS con permiso y posiciones públicas emuladas; sesión retirada al detener. Cero errores de página. [Registro15comprobaciones](parquemet/live-verification.json), [selector alojado](parquemet/live-picker.png), [mapa alojado](parquemet/live-world.png).

La verificación no es una salida en bicicleta ni un teléfono físico. Se conservan los límites de [fuentes geográficas](parquemet-geographic.md) y [documento oficial](parquemet-official-document.md). El PDF no se convierte en una transformación GPS ni se confirman accesos/sentidos actuales. Las credenciales de publicación/QA se manejaron sólo en memoria y stdin oculto, sin archivos ni inclusión en Git.

`main` permanece87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9. La aplicación anterior y sus almacenes no fueron modificados. Implementación y reproducción: [parquemet.md](parquemet.md).
