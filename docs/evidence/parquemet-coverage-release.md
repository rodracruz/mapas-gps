# Publicación privada comprobada: cobertura y miniaturas oficiales

2026-10-20. Código `e6a1e04bd270e100befc855a333ec61289f85471`, rama `fix/parquemet-cycling-coverage`. [PR #6 en borrador](https://github.com/rodracruz/mapas-gps/pull/6), apilado sobre `feat/parquemet-second-park` / PR #5. Worktree conservado para continuación.

- URL real: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/parquemet#parque=parquemet . Es la copia privada desplegada, no `localhost` ni GitHub Pages.
- Proyecto `appgprj_6ad51f7eb4a08191bf1159e60380c2d4`; versión12 `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_a9da5d38ff7c81918c7345246227a712`; despliegue `appgdep_6ad78f1a29a881919fb03c75a500c71e`, `succeeded`.
- Fuente de hosting `ff87918b359829e2c804eaa1beedc347eadfd036`, preparación/commit/push/archive mediante helper de fuente, credenciales sólo por stdin oculto y memoria de sesión.
- Audiencia conservada: custom, un usuario propietario, cero grupos/visitantes externos. HTTPS anónimo devuelve401. Comprobación autenticada de ambos HTML y assets, con header de QA limitado al mismo origen; no se guardan credenciales en pruebas/evidencia.
- HTML principal3.400.397bytes SHA256 `11682ef4265d2ed73d875b9bd1b422676eb6486c5db7fd2fd1a4905d71e1905e`; Parquemet966.222bytes SHA256 `225429fcc82708fb4ee5973e0485956599ed91be265bc9b35540148cb935c04c`. Respuestas HTTPS idénticas a los bundles probados.
- ZIP privado `/downloads/mapas-gps-todos-senderos.zip`:12.415.983bytes, SHA256 `6ccf887af9bd7e4c9d3702136cc33d0d3e2533df12365b045bef052967839f9e`. Incluye ambos bundles, curvas editables de ambos planos, snapshot/catálogo/documento Parquemet, fuentes públicas y foto privada anterior dentro del bundle. No subir a Git público.
- Archivo de despliegue24.075.859bytes SHA256 `09b526c59d381404aa491f0ff8110ecaa861b351edc41a58f0a9ed2a8880a833`.

Verificación real en Chromium móvil390×844: selector de dos parques, mapas y curvas exactas, foto oficial2570×3077 y original privado960×1280 conservados, veinte miniaturas El Durazno y ocho Parquemet, ampliación aislada, ocho rótulos geográficos,59 líneas atribuidas, PDF original6690px con zoom, superposición alineada, restricciones, distancias PDF/OSM diferenciadas, regreso sin mezclar datos y cero errores JavaScript. Se comprobaron además la demo pública y permiso GPS con posiciones públicas emuladas por CDP; no es validación de terreno. [Recibo sin secretos](parquemet-coverage/live-verification.json).

[Mapa publicado](parquemet-coverage/live-world.png), [ficha publicada](parquemet-coverage/live-preview.png), [ruta aislada publicada](parquemet-coverage/live-route-only.png). [Método, pruebas y límites](parquemet-coverage.md).

`main` y Pages permanecen en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`. Los datos personales, mapas locales y GPS no se trasladan al repositorio. Ninguna transformación geográfica del PDF se declara validada.
