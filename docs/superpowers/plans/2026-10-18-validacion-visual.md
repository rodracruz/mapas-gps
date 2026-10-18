# Validación visual y corrección de dos giros

> Ejecución autorizada por el usuario: validar y corregir autónomamente. Usar `superpowers:executing-plans`; no se requiere otra aceptación para este alcance.

**Objetivo:** contrastar los tres trazados con la fotografía, incorporar los dos zigzags visibles de La Virgen y ajustar el gancho inferior de Lomo Vetado.

**Arquitectura:** conservar el plano 900×1100, las fuentes y todos los IDs existentes. Añadir un fragmento visual con ID nuevo para los zigzags; conservar el ID del antiguo recuadro como revisión resuelta. La continuidad dibujada no habilita conexiones geográficas.

**Fuentes y límites:** foto original fijada por SHA; PDF oficial como contraste de forma, no prueba de edición completa ni GPS. Tolerancia RDP 1 px; observaciones manuales de giros con tolerancia local 1,5 px, sin afirmar precisión subpíxel.

## Trabajo

- [x] Inspeccionar originales y solicitar revisión independiente directamente contra la foto.
- [x] Escribir y ejecutar regresiones que fallen por el zigzag ausente y el ápice del gancho desplazado.
- [x] Guardar observaciones editables y aplicar correcciones reproducibles sin cambiar otros fragmentos/extremos.
- [x] Actualizar conteos, recortes y documentación; probar esquema, curvas, idempotencia y rechazo de fuente distinta.
- [x] Ejecutar suites de navegador/móvil y autónomo; inspeccionar ampliaciones corregidas y revisión independiente.
- [x] Registrar consulta actual de OSM, falta de metadatos geográficos del PDF y controles no validados.
- [ ] Subir la rama, actualizar el mismo visor privado, verificar la URL y regenerar la entrega.

## Focos de revisión

- No recortar cuñas claras entre los dos retornos verdes.
- No crear una conexión por compartir coordenadas de imagen.
- No perder IDs al retirar un recuadro de la lista pendiente.
- No aplicar correcciones a otro archivo fuente o a una revisión de datos incompatible.
- No presentar tolerancia de simplificación o concordancia de dibujo como exactitud geográfica.
