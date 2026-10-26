# Recuperación de la exportación: 2026-10-26

Se retomó el mismo proyecto y la misma rama; no se creó otro diseño ni otra aplicación. El acceso autenticado funciona. No hace falta repetir el inicio de sesión ni volver a enviar el encargo.

## Evidencia nueva

| Acción | Resultado observado por el navegador automatizado |
|---|---|
| Revisar el proyecto y sus pantallas | Explore, Expeditions y Profile aparecen renderizadas; el documento de integración existe; varias pantallas siguen como «Generating Screen…». La versión de ciclismo completa no está visualmente comprobada. |
| Menú de una pantalla → Download | Se pulsó la opción habilitada; el menú se cerró. No se expuso archivo, URL ni confirmación de descarga. Esto no demuestra que el proveedor rechazara la operación. |
| Menú de una pantalla → Export | El panel ofreció `.zip`, Code to Clipboard y destinos de terceros. La presencia de esos destinos no impide elegir una descarga. No se activó ninguno. |
| Seleccionar Explore → `.zip` → Export | La herramienta informó que seleccionó una pantalla, eligió `.zip` y confirmó Export. No devolvió bytes, archivo ni URL que permitieran comprobar la descarga. No se considera un ZIP entregado. |
| Seleccionar Explore → Code to Clipboard | Se observó **«Code copied to clipboard»** con una pantalla en la cola. El resultado devolvió `files: [{name: "explore.html", content: null}]`. |
| Leer únicamente ese código recién copiado | La herramienta informó **«Browser permissions prevent reading clipboard after the successful Copy»**. No se obtuvo el contenido ni se amplió el permiso para intentar eludirlo. |

Los reportes íntegros permanecen en los artefactos privados de la tarea. No se guardan sesiones ni enlaces privados del proyecto en el repositorio público. El último resultado sólo acredita la copia de una pantalla llamada Explore; no permite afirmar que sea la segunda iteración SUDA.

## Bloqueo y continuación mínima

Acción bloqueada: recuperar el código ya copiado desde el navegador automatizado para inspeccionarlo e integrarlo aquí. Destino: la exportación del proyecto existente de Stitch. Causa informada: permiso de lectura del portapapeles del navegador. La exportación ZIP tampoco entregó un archivo recuperable mediante la herramienta disponible.

Se necesita **un canal de transferencia de archivo desde el navegador autorizado** que entregue el ZIP/HTML real de la segunda iteración de ciclismo. Si se dispone de otro navegador conectado con esa capacidad, usar el mismo proyecto y sesión; no crear un reemplazo. Como alternativa mínima, basta recibir una exportación real de esa iteración. No hacen falta nuevos servicios, facturación, claves publicadas, acceso a ubicaciones ni otro inicio de sesión.

Hasta recibir contenido recuperable, no se repiten la misma lectura denegada ni la confirmación ZIP sin una vía para recoger el resultado. Tampoco se integra una pantalla inicial de aventuras como si fuera la segunda versión de ciclismo.

## Trabajo que sigue pendiente

1. Inspeccionar el archivo real, identificar las pantallas de la iteración solicitada y conservar el original de la exportación.
2. Contrastar las 47 fichas y los estados con [CATALOGO-INTERCAMBIO.json](CATALOGO-INTERCAMBIO.json), [CONTRATO-INTEGRACION.json](CONTRATO-INTEGRACION.json) y [PROPUESTAS-SUDA.md](PROPUESTAS-SUDA.md). Corregir datos de ejemplo sin alterar geometrías ni fuentes.
3. Integrar el diseño en una rama de producto aislada. Los módulos propuestos no se presentan como servicios conectados por el hecho de estar dibujados.
4. Ejecutar pruebas de datos, GPS simulado, almacenamiento y móvil con comparación visual del diseño recuperado. No se afirma validación física de GPS.

En esta recuperación no se cambió código de producto, el sitio alojado, main, originales, permisos ni servicios. La preparación y los intentos de exportación no equivalen a una integración terminada.
