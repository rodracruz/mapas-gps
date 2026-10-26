# Estado del trabajo en Stitch

**Actualización 2026-10-26:** acceso autenticado confirmado; selección y copia de una pantalla realizadas. La lectura del código copiado quedó bloqueada por permisos del navegador y el intento ZIP no entregó un archivo recuperable. No se repite la configuración ni se considera terminada la integración. Evidencia, límite concreto y continuación mínima: [RECUPERACION-2026-10-26.md](RECUPERACION-2026-10-26.md).

Inicio de sesión de trabajo:2026-10-23. Base funcional: `31e5c69`. Rama de documentación: `docs/stitch-handoff`. Los enlaces de acceso, identificadores de sesión y reportes completos se conservan fuera del repositorio público.

## Trabajo realizado

- Se abrió el proyecto existente con la sesión autorizada y se revisó su historial. No hay una etiqueta numérica inequívoca de segunda versión; se identificó la iteración de ciclismo SUDA por su contenido e historial. La agrupación funcional Expeditions no se tomó como una versión.
- Se envió el encargo funcional al chat del proyecto, con enlaces públicos al código exacto, funciones, contrato de controles y cuatro capturas. Se observó la revisión **Mapas GPS · Integración SUDA v2**, su documento de integración y una pantalla de rutas. No se afirma que se haya importado el ZIP completo ni todos sus archivos.
- Se solicitaron pantallas y estados para parques, rutas, detalle, mapa/GPS, offline, actividad/perfil, garaje, encuentros y seguridad, distinguiendo implementación actual de propuestas.
- Se detectaron categorías y medidas de ejemplo que no corresponden a las fuentes. Se enviaron correcciones generales y después el catálogo literal de 47 fichas para modificar la pantalla correspondiente.
- Se regeneró ese catálogo con `fromOsmSnapshot` y `routeFilterModels`: El Durazno 21, Parquemet 26; tipos 8 Trail/12 Park/1 Subida y 8 Sendero ciclista/6 Paseo compartido/11 Avenida/1 Camino. Dificultades de Parquemet ausentes, sin inferirlas. Controles: Lomo Vetado 2786 m, Calibre 12 2160 m y Centenario 609 m de geometría OSM importada.

## Verificación que aún requiere evidencia

El envío del encargo no demuestra que todas las pantallas hayan aplicado las correcciones. En una revisión posterior seguían apareciendo categorías DH/XC y valores de ejemplo. Algunos títulos decían «Generating Screen…» y el navegador automatizado no entregó capturas descargables para una comparación independiente.

Los intentos de exportación mostraron «No screens selected». Esto indica que la automatización no seleccionó correctamente las pantallas; no acredita una restricción de permisos ni que el proyecto no permita exportar. El intento dirigido mediante Modify también terminó sin cambio visual confirmado ni exportación. La inspección detectó además que la pantalla Profile, identificada previamente como mapa, contenía estadísticas de aventura: no se debe reutilizar esa identificación como si estuviera verificada.

Se intentó recuperar directamente el HTML de la pantalla de rutas a partir de su DOM o de View Code, buscando los controles reales de selección de parque en lugar de confiar en títulos del lienzo. El navegador automatizado informó que los controles aparecían en una vista renderizada, pero View Code sólo devolvía una envoltura React y una referencia a un bundle, sin el HTML editable de esa pantalla. No se obtuvo el código ni una captura descargable que permitiera una revisión independiente. Esto describe el resultado de la automatización utilizada; no demuestra que Stitch carezca de exportación ni que haya un problema con la cuenta.

**Resultado: encargo enviado; revisión creada; corrección visual completa y exportación sin verificar.** No se incorporó código de esas pantallas a la aplicación. Para continuar se necesitan una exportación real o contenido de pantalla recuperable y una comparación con el catálogo, sin volver a enviar el mismo encargo ni repetir la configuración de acceso.

## Límites de esta entrega

El trabajo realizado en Stitch es diseño. No se han integrado en el producto servicios de perfil, eventos, Beacon, descargas offline ni navegación completa. Los controles dibujados no prueban su funcionamiento. Se conserva la aplicación actual y su construcción privada; no se cambia main, GitHub Pages ni la audiencia del sitio.

Antes de integrar una exportación: inspeccionar código y datos, conservar las geometrías/fuentes e identificadores del contrato, conectar controles al motor existente y ejecutar pruebas de datos, GPS y móvil. El plano visual no se convierte en geometría GPS por redibujarlo. Ver [PROPUESTAS-SUDA.md](PROPUESTAS-SUDA.md), [CATALOGO-INTERCAMBIO.json](CATALOGO-INTERCAMBIO.json) y [CONTRATO-INTEGRACION.json](CONTRATO-INTEGRACION.json).
