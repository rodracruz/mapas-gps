# Despliegue privado de continuidad GPS

Comprobado el2026-10-20, despliegue terminado14:49:33 UTC. URL real alojada y autenticada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site. No es una URL local ni GitHub Pages.

- Código funcional `a59a13a`, rama `feat/gps-route-continuity`; [PR #4 en borrador](https://github.com/rodracruz/mapas-gps/pull/4), base `feat/all-trails-from-sign`.
- Commit de alojamiento `2410f619fbc7150499ca986094904ef6d8ccca94`.
- Deployment `appgdep_6ad77f67e9cc8191b042fc9a00acf3aa`, estado nativo `succeeded`.
- Versión `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_47f3d5052558819195af4f1354a74882`.
- HTML3.387.394 bytes; SHA256 `6cca255e0dabe7c1b2ecf775df86017a4d5effdbf8d1d788178d5ca4f44ef046`, idéntico en build y respuesta alojada.
- Descarga privada actualizada `/downloads/mapas-gps-todos-senderos.zip`, HTTP200 con autorización;8.471.306 bytes, SHA256 `9a0c1fbd2782e9a3ca78f7927c8659011a3a98a8e7548721649515476590d78a`, idéntico al artefacto local.

Se conserva el mismo proyecto y acceso de su propietario, sin ampliar audiencia. La solicitud anónima devuelve401. El ZIP contiene la foto privada y sólo se entrega detrás del mismo acceso; no está en GitHub. Las credenciales de escritura y de QA sólo se pasaron mediante stdin con eco oculto, sin guardarlas en archivos ni el código.

La verificación HTTPS independiente ejecutó la selección del parque, imagen oficial2570×3077 y original privado960×1280 intacto,21 fichas más mapa,23 curvas del cartel,29 rótulos,45 puntos y comparación con13 vías OSM. Fondo real con9 teselas cargadas, selección y ficha inferior, visor fotográfico anterior intacto. Después recorrió las49 posiciones de la demo y observó la transición Lomo→Calibre12 por nodo compartido. La geolocalización nativa del navegador recibió permiso y posiciones públicas emuladas por CDP: adquirió Lomo y retiró la sesión al detener. Cero errores JavaScript. [Registro de QA](gps-continuity/live-verification.json), [captura alojada de la demo](gps-continuity/live-demo-mobile.png).

Esta prueba no es GPS sobre terreno ni un teléfono físico. Las limitaciones geográficas y de privacidad están en [implementación y pruebas](gps-continuity.md). `main` remoto permanece `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`; no se publica sobre Pages ni se fusionan las ramas.

Para probar: abrir el sitio autenticado → El Durazno → Mapa de senderos → **Probar recorrido**. **Mi ubicación** solicita GPS real; activa la comparación OSM y su identificación experimental. El cartel todavía no tiene una calibración GPS aceptada.
