# bikeride: funciones pendientes después de la integración visual

Diagnóstico del 2026-10-26, sobre `4cbe0e2`, rama `feat/bikeride-stitch-integration`. Esta revisión documenta el alcance pendiente; no implementa esos módulos, no cambia main y no actualiza la publicación privada versión 19. Las 130 pruebas de la entrega anterior verifican sus funciones existentes, no la terminación del producto.

**Diagnóstico en pausa:** el usuario priorizó corregir la fidelidad visual. Esa corrección se publicó después como versión20; ver [estado actual](ESTADO-STITCH.md). Ninguna función futura de este diagnóstico se implementó durante esa corrección.

## Evidencia recuperada

El ZIP recibido sigue legible: 278768 bytes, cuatro archivos, CRC correcto y SHA256 `ee1a8c4dbc98642089f14dee7f0ef8cb150bd5d57b6f5b1454f7d59318daae06`. Se conserva fuera de Git. Contiene una pantalla HTML/captura y dos documentos; no contiene pantallas funcionales independientes de Perfil, Encuentros, Garaje o Beacon. Perfil y Encuentros aparecen como navegación sin destino implementado; Garaje y Beacon están descritos en el documento. Las propuestas históricas más amplias figuran en [PROPUESTAS-SUDA.md](PROPUESTAS-SUDA.md), sin atribuirles código exportado que no existe.

La base real tiene 21 fichas en El Durazno, de las cuales 11 tienen correspondencia nominal OSM, y 26 en Parquemet, todas con correspondencia nominal OSM. Esa correspondencia no acredita acceso, sentido ni precisión de navegación: ambos catálogos mantienen `navigationValidated:false`. Ninguna de las 47 fichas tiene ascenso/descenso documentado. No se pueden producir altimetría, récords personales ni obstáculos a partir de los ejemplos de Stitch.

## Qué puede completarse localmente y qué falta

| Módulo | Implementación real local, sin un servicio nuevo | Ampliación que necesita servicio, permiso o datos externos | Datos faltantes y límite del cierre |
|---|---|---|---|
| **Perfil y actividad** | Perfil opcional en este dispositivo; preferencias, favoritos e historial de actividades realmente guardadas. Exportar/importar y borrar datos. Grabar una actividad sólo después de una acción explícita; iniciar, pausar, continuar y terminar. | Cuenta y sincronización entre dispositivos; rankings o comparación entre personas necesitan identidad, servidor y reglas de acceso. Grabar de forma fiable con pantalla bloqueada requiere evaluar soporte móvil y, si corresponde, otra plataforma. | Hoy el GPS sólo existe durante la sesión y se detiene al cerrar el mapa o salir del documento. Falta registro y cálculo de estadísticas. No importar la demo como actividad personal. Nombre y datos de bicicleta pueden introducirse después en la app; no bloquean construir el módulo. |
| **Mi Garaje** | Crear/editar/eliminar bicicletas, componentes, presiones introducidas por el usuario, servicios de mantenimiento y recordatorios locales al abrir la app. Asociar bicicleta a una actividad. | Sincronización, notificaciones push y vinculación a sensores dependen de servicios o compatibilidad/permisos adicionales. Recomendaciones automáticas de PSI/sag requieren datos oficiales del modelo y configuración. | Faltan modelo/año de bicicleta y suspensión, unidades, recomendaciones del fabricante e historial real. Se puede guardar lo que el usuario introduzca, con su procedencia, sin prescribir una presión inventada. La calibración geográfica de fotografías anterior es una función distinta. |
| **Encuentros** | Agenda personal de salidas: crear fecha, zona horaria, parque/ruta, notas y estado personal; guardar localmente y exportar un archivo de calendario. Pantalla vacía hasta que existan datos reales. | Directorio compartido, publicación de eventos, cupos, inscripciones, participantes reales, moderación, mensajes o invitaciones necesitan almacenamiento compartido e identidad/controles de acceso adecuados. Un catálogo oficial de eventos también necesita fuente y vigencia contrastadas. | No hay agenda real de organizadores ni eventos acreditados en el ZIP. La agenda local no equivale a confirmar asistencia ante un organizador. No mandar invitaciones ni escribir en calendarios ajenos al construirla. |
| **Beacon** | Preparar una acción manual **Compartir posición actual**: obtener una lectura voluntaria, mostrar hora/precisión y permitir que la persona abra el mecanismo de compartir del teléfono. Es un envío puntual decidido por ella; no un Beacon en vivo. | Ubicación en vivo entre dos dispositivos necesita un receptor remoto/relay, sesiones privadas, acceso limitado, caducidad y revocación, confirmación de recepción/antigüedad y retención definida. Puede usar HTTP, SSE o WebSocket; no exige una tecnología ni un proveedor pago concretos. | Faltan proveedor/destino, modelo de acceso de los destinatarios, retención y decisión sobre funcionamiento en segundo plano. La app privada del propietario no da acceso automáticamente a terceros. No presentar activación visual o lectura local como seguimiento recibido ni protección de emergencia. Batería no está disponible de forma uniforme en navegadores. |
| **Sin conexión** | Paquetes acotados por parque con catálogo, geometría OSM ya obtenida, fuentes/atribuciones, recursos de interfaz y planos permitidos. Verificar hashes/tamaño, descargar por acción explícita, listar estado real, gestionar cuota, eliminar y recuperar una descarga interrumpida. Abrir tras cerrar/reabrir el navegador sin red dentro de ese alcance. | Un fondo geográfico offline requiere datos propios o proveedor con permiso de descarga/redistribución. Sincronización entre dispositivos requiere un servicio. Que los datos OSM sean abiertos no autoriza descargar los mosaicos de su servicio estándar. | Falta definir cobertura/zooms y fuente del fondo, comprobar derechos de redistribución de cada plano y probar cuota/evicción real en Android/iOS. No prometer todo el mundo offline ni disponibilidad permanente del almacenamiento del navegador. |

## Arquitectura que ya condiciona la siguiente etapa

- `geographic/gps.mjs` usa `watchPosition`, mantiene posiciones sólo en memoria y llama a `stop()` en `pagehide` y al cerrar el mapa. La grabación voluntaria debe tener su propio ciclo de vida explícito; no se obtiene añadiendo un contador al panel actual. La elección de pista probable debe seguir separada de la lectura original y de las medidas de actividad.
- `app.js` conserva mapas y calibraciones en IndexedDB `mapas-gps-v1`, almacén `maps`. Para los módulos nuevos se propone otra base de datos versionada, sin migrar ni sobrescribir esa base. La exportación de trazas personales debe ser una acción local del usuario, nunca parte de los datos públicos del repositorio.
- `geographic/bikeride.mjs` deshabilita Perfil/Encuentros. Se habilitarán sólo cuando haya flujos reales, estados vacíos y gestión de errores. `navigator.onLine` indica red del navegador, no disponibilidad del servidor ni paquete descargado.
- Los dos constructores autónomos incrustan código/datos, pero el fondo usa `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Los HTML autónomos no constituyen una instalación offline comprobada. El paquete privado versión 19 conserva planos en archivos separados y no incluye `sw.js` ni manifest de instalación.
- El service worker antiguo, registrado desde `app.js`, precarga la aplicación de fotografías y cachea otros GET del mismo origen cuando se visitan. No instala todos los módulos de los parques ni mosaicos de otro origen. Su activación elimina toda caché cuyo nombre difiera de `mapas-gps-v3`, y su recuperación de errores devuelve `index.html` incluso para recursos que deberían ser JSON/JS. Son condiciones preexistentes que deben corregirse y probarse al introducir paquetes; esta revisión no modifica el service worker ni borra cachés del usuario.

## Política offline contrastada

Se consultó la [política oficial de mosaicos de OSM Foundation](https://operations.osmfoundation.org/policies/tiles/) el 2026-10-26: HTTP 200, 18698 bytes, SHA256 `04908a9e2faf70ad3090b3b2db43de100f3ad61243c578413b67fb57ba6b6912`.

> “Offline use is not permitted on tile.openstreetmap.org.”

La misma sección prohíbe precargar áreas/zooms y crear archivos de mosaicos para distribución; recomienda alojamiento propio o proveedor que permita offline. La caché normal de navegación, respetando sus cabeceras, es un caso distinto. No se descargaron mosaicos para esta investigación. El uso de los snapshots vectoriales OSM existentes conserva ODbL y atribución; no convierte el plano esquemático en cartografía GPS.

## Propuesta de siguiente etapa

Se recomienda **completar primero una versión local utilizable**, conservando el alojamiento estático y JavaScript/Leaflet. Permite desarrollar funciones reales sin contratar servicios ni resolver identidad entre usuarios. Una alternativa sería empezar por cuentas, agenda compartida y Beacon; añade infraestructura, tratamiento de ubicaciones y pruebas entre dispositivos antes de mejorar el uso individual. Esa alternativa necesita decisiones específicas y no desbloquea por sí sola el uso offline.

Orden de implementación propuesto, todavía no ejecutado:

1. **Persistencia nueva y Perfil local.** Crear modelo versionado de preferencias/favoritos/actividades y módulo de lectura/escritura/importación/exportación/borrado; estados vacíos reales. Mantener intactos los 47 IDs, geometrías, claves y mapas anteriores.
2. **Garaje.** Bicicletas, componentes, ajustes introducidos por el usuario y mantenimiento local. Unidades y fechas explícitas; no recomendaciones de presión sin fuente. Vinculación opcional con actividades.
3. **Registro de actividad en primer plano.** Acción separada del GPS de consulta; pausa/continuación/fin, recuperación de sesión interrumpida y métricas con lecturas válidas. Excluir demo; no sumar saltos/lecturas antiguas; mostrar huecos/incertidumbre. La distancia de una traza registrada y la distancia restante por una red validada son medidas diferentes. Desnivel y auto-pausa necesitan reglas y pruebas propias; no rellenarlos con constantes ni derivarlos del cartel.
4. **Paquete offline por parque.** Primero interfaz/catálogos/vectores/planos autorizados con fondo ausente identificado. Descargas transaccionales/versionadas, comprobación de integridad/cuota y service worker compatible con la app anterior. Añadir fondo offline sólo cuando exista una fuente permitida y cobertura definida.
5. **Agenda personal de encuentros.** Alta/edición/baja, fecha/zona horaria y exportación de calendario; cero eventos precargados inventados. Mantener separado cualquier futuro listado compartido/participación.
6. **Compartir una posición puntual.** Si se incluye, nombrarla y probarla como tal. Beacon en vivo queda como etapa propia después de seleccionar receptor, permisos y retención; no se habilita un falso interruptor de seguridad.

Los pasos locales no necesitan que Rodrigo aporte ahora nombres, actividades, contactos o una bicicleta para poder construirlos: son entradas de los futuros formularios. Ninguno implica publicar una nueva versión o modificar permisos. La ejecución de esta propuesta y su publicación se gestionan por separado.

## Bloqueos agrupados para decidir con el usuario

**No bloquean el desarrollo local:** alias, bicicleta, ajustes y eventos se ingresan en la app. Una interfaz vacía y funcional es el resultado correcto hasta recibirlos. Perfil/garaje/agenda/exportación locales no necesitan backend nuevo.

**Decisiones de servicio antes de conectar funciones entre personas:** cuenta/sincronización, organizadores e inscripciones compartidas, y Beacon. Se necesita elegir proveedor o infraestructura existente, alcance de acceso de destinatarios, retención/borrado y presupuesto si lo hubiera. El alojamiento estático actual no aporta esos servicios. No se presupone que sean pagos ni que el permiso de diseñarlos autorice contratar o ampliar acceso.

**Datos y licencias antes de afirmar cobertura:** fondo offline y su área/zooms; modelos/documentación de suspensiones si se quieren recomendaciones; fuentes de elevación/obstáculos; conexiones/sentidos/accesos para destinos y loops. Satélite/3D requieren fuente e integración y no están resueltos por esta propuesta.

**Comprobación física antes de prometer continuidad móvil:** pruebas Android/iOS de almacenamiento, reinicio, modo avión, bloqueo de pantalla y reanudación. El navegador puede suspender actividad/GPS en segundo plano; no se elimina esa limitación con un temporizador o service worker. Un Beacon de uso fiable con pantalla bloqueada puede exigir otra plataforma; debe decidirse con pruebas, no asumirse.

## Criterios verificables del siguiente cierre

Estos son criterios propuestos, **no pruebas ya pasadas**:

- Crear/editar/borrar perfil, bicicleta y salida; recargar y comprobar valores; exportar/importar con validación de esquema y errores de cuota. Rechazar archivos inválidos sin perder datos previos. Demostrar que Blob/calibración/trazados anteriores quedan idénticos.
- Grabar sólo tras acción explícita, distinguir consulta/registro/demo, demostrar pausas/reinicio/fin y ausencia de envíos personales a servidores. Verificar cálculos con lecturas públicas sintéticas y huecos/jitter/posiciones antiguas; no presentarlos como salida física.
- Instalar un paquete de cada parque, cortar la red y cerrar/reabrir; comprobar rutas, planos, favoritos y GPS con estados de señal. Verificar cancelación/corrupción/cuota/actualización/evicción y no borrar cachés ajenas. El fondo se indica ausente si no está incluido; un ensayo que sólo falla mosaicos no acredita arranque offline.
- Agenda: fechas/zona horaria, salida pasada/cancelada, archivo de calendario correcto; ningún contador de asistentes real sin servicio que lo respalde.
- Beacon futuro: dos clientes independientes, receptor autorizado, lecturas con hora/precisión, caducidad y revocación real incluso al conservar un enlace antiguo; desconexión y cierre de sesión visibles. No aceptar una demo local como esta prueba.
- Repetir regresiones de datos, 47 fichas, móvil/rotación/GPS y mapas guardados cuando cambie código. La validación de terreno y de red navegable sigue separada de las pruebas de navegador.

## Verificación de este diagnóstico

Se releyeron ZIP/documentos, propuestas históricas, controladores GPS, navegación, catálogos, constructores y service worker. Se recalcularon CRC/SHA256 del ZIP y los conteos 21/26, 11/26 correspondencias nominales y 0/47 fichas con altimetría. Se inspeccionó el listado del archivo privado versión 19 y se consultó la política OSM por HTTPS. No se ejecutó el código del prototipo ni se le atribuyeron servicios reales.

No se repitieron las 130 pruebas ni la validación móvil anterior porque esta revisión sólo modifica documentación. Su evidencia se conserva en [bikeride-stitch](../../evidence/bikeride-stitch/README.md). No se probó nuevo Beacon, registro persistente, agenda ni offline completo: todavía no están implementados. No se amplió acceso, contrató servicio ni publicó versión nueva.
