# Entrega de validación GPS en móvil

2026-10-21. Código funcional `a95db68` (incluye `62d4066`), rama aislada `test/gps-validation`, [PR #11 en borrador](https://github.com/rodracruz/mapas-gps/pull/11), sobre `feat/park-route-filters` (#10). [Funcionamiento, reproducción, fallos corregidos y límites](gps-validation.md).

Vista previa privada comprobada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/#parque=el-durazno&mapa=1 . Parquemet conserva el acceso desde el selector y su propia geolocalización. Es una aplicación alojada en Sites, con un propietario, cero grupos y cero visitantes externos; no es localhost ni GitHub Pages.

Despliegue final versión18 confirmado `succeeded`: `appgdep_6ad89d3c64b08191904ac8f4b3853e8d`, versión `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_8016531e211881918bccc22750bec4ce`. Fuente privada `6fd6d7b1e5ecc08d7347ac28c3721a4f22e8d616`. La versión17 anterior ya se había comprobado por HTTPS antes de corregir el orden de dibujo del punto frente a los rótulos.

| Artefacto final | Bytes | SHA256 |
|---|---:|---|
| index.html | 3427813 | `ac0d7b50271b538939beff5bafac9c1e0567f94917fd4a81b481c0f352d52dbf` |
| parquemet.html | 1376053 | `f3c81cbef9354ac345881b01f2bfdb22e46fa41b04bbb882c558f417b66fe143` |
| ZIP privado | 12640961 | `307542008f3cdaaeebe35d5155aada577f309819a986678430f301d79d7371dd` |

El ZIP sigue en `/downloads/mapas-gps-todos-senderos.zip`, conserva sus fuentes, datos editables y foto privada, y añade `GPS-PRUEBAS.md`. Foto, ZIP y HTML con foto permanecen fuera de Git público.

[Verificación local](gps-validation/local-verification.json):130/130 pruebas unitarias;49 posiciones públicas de demo en cinco tamaños, fuente y standalone; API GPS nativa de Chromium con posiciones OSM emuladas en ambos parques, adquisición probable, ficha, giro, recentrado, lectura imprecisa sin ajuste y falta de teselas. Se comprobaron continuidad/cambio por nodo compartido, lectura/aro separados, Cartel excluido del ajuste, pérdida de señal, caducidad, recuperación, permiso rechazado, detener/cerrar, ausencia de escrituras de seguimiento, almacenamiento anterior y controles táctiles. Las regresiones de filtros y mapa también pasaron. Revisión independiente terminada sin hallazgos importantes pendientes.

La prueba de almacenamiento conserva exactamente un Blob de imagen sintética, calibración, senderos, centro web y localStorage al recorrer app anterior → demo GPS → app anterior con su service worker real. Ningún archivo ni posición personal se usa en esta prueba.

Capturas de datos públicos emulados: [demo móvil](gps-validation/demo-390x844.png), [horizontal](gps-validation/demo-844x390.png), [GPS El Durazno](gps-validation/native-el-durazno.png), [GPS Parquemet](gps-validation/native-parquemet.png), [sin teselas](gps-validation/no-tiles-el-durazno.png).

La prueba se realiza en Chromium automatizado, no con GPS físico ni una salida en bicicleta. No valida accesos, sentidos ni correspondencias pendientes sobre terreno. Main/Pages permanece en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`; no se fusionaron ramas ni se hizo force-push. El servidor temporal local de QA se detiene al finalizar; la URL privada es el resultado accesible.

Verificación final en HTTPS: ambos HTML coinciden exactamente con los SHA256 anteriores. Las49 lecturas de demo permanecieron visibles, la expansión de filtros con demo pausada reposicionó la cámara y la transición Lomo→Calibre12 se produjo por nodo compartido. La API GPS nativa adquirió la pista con lecturas públicas emuladas en ambos parques; ficha, giro320×568/844×390, recentrado, precisión de100m sin ajuste y detención pasaron, con el punto por encima de los rótulos y sin errores JavaScript. Acceso anónimo HTTP401 y ZIP autenticado HTTP200 con hash exacto. [Registro HTTPS](gps-validation/live-verification.json), [descarga verificada](gps-validation/download-verification.json), [demo alojada](gps-validation/live-demo.png), [El Durazno corto](gps-validation/live-el-durazno.png), [Parquemet corto](gps-validation/live-parquemet.png).
