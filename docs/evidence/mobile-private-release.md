# Publicación privada del flujo móvil

18-10-2026, 22:13 America/Santiago. Aplicación: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site

- Código probado: `1085c7b8c3b2ad6c6906613285c965bb2d88b3be`, rama `feat/mapa-geografico`.
- Revisión de código: [PR #2 en borrador](https://github.com/rodracruz/mapas-gps/pull/2), sin fusionar. `main` GitHub permanece en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`.
- Alojamiento independiente: proyecto `appgprj_6ad51f7eb4a08191bf1159e60380c2d4`, commit de fuente alojada `b7d59ac27f5ad94e73924344f2d28df517c7df71`.
- Versión: `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_dd67a8a3ac0081918cf78ba4b17d7e80`.
- Despliegue: `appgdep_6ad56e97b2408191bdbbcaabf005dfda`, estado `succeeded`.
- SHA256 del HTML principal construido y servido: `f069a608feb90d76df6a805d1badd8c6656d3e6681ca7e4f79e89b7ea29f293a`.
- Audiencia preservada: una cuenta propietaria, cero grupos. Solicitud anónima comprobada: HTTP401. No se publicaron credenciales ni trazas personales.

## Comprobación del sitio real

Navegador móvil emulado390×844, usando el acceso de comprobación del alojamiento en memoria y solo en su propio origen; no se generó ni rotó un token adicional. Siete controles ejecutados:

1. Acceso privado preservado.
2. Bytes publicados idénticos al artefacto probado.
3. Elegir parque, cinco tarjetas y dos líneas geográficas cargadas.
4. Información desplegable y ausencia de velocidad personal inventada.
5. Mapa a pantalla completa, once teselas realmente cargadas en la captura, una instancia Leaflet, cero iframes y ficha inferior de Lomo.
6. Revisión fotográfica anterior completa accesible, diez fragmentos y botón para la foto original recibida.
7. Cero errores de ejecución.

El alojamiento redirige `/mapas-gps-revision.html` a `/mapas-gps-revision`. Se comprobó el destino200 y la navegación autenticada siguiendo esa redirección interna. La primera prueba solo propagaba la cabecera de acceso a la petición inicial y llegaba a la pantalla de login; se corrigió la instrumentación sin modificar producto ni audiencia.

Capturas y resultado sanitizado en `/workspace/artifacts/mapas-gps-live-{picker,park,map}.png` y `mapas-gps-live-verification.json`. El paquete `mapas-gps-mobile.zip` incluye aplicación, revisión completa privada y JSON editables; no añadir ese paquete al repositorio público porque conserva la foto completa recibida. Los datos públicos/código están en la rama y PR.

El script de sincronización incluido en el catálogo de Sites no estaba disponible como archivo ejecutable en este entorno. Se hizo la operación equivalente sobre el checkout privado existente: credencial temporal por stdin sin eco, cabecera Git en memoria, commit/push de la fuente exacta y `git archive` de manifest+dist antes del despliegue. Ningún token se guardó en archivos o remotos.

El flujo y pruebas están en [mobile-parks.md](mobile-parks.md). Este despliegue permite probar el recorrido de uso; no resuelve las geometrías pendientes de La Virgen/Starwars ni habilita navegación sobre una red.
