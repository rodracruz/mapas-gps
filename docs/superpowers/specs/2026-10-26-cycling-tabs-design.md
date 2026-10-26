# bikeride: cinco vistas ciclistas con funciones reales

El usuario aprobó integrar las cinco pantallas ciclistas del segundo ZIP y dejar expediciones/alquileres fuera. Se ejecuta en la misma rama/worktree desde5fbf13b y publicación privada21, sin nuevas preguntas de inicio. La revisión está en docs/handoff/stitch/REVISION-PESTANAS-2026-10-26.md. Originales privados: /workspace/private-sources/stitch-tabs-84a113e38416/extracted/stitch_outdoor_activity_finder. No publicar esos originales ni el ZIP.

## Resultado y arquitectura

Añadir Explorador de rutas, Detalle técnico, Perfil/actividad/garaje y Encuentros/agenda personal, y adaptar Mapa GPS en ruta al diseño. Conservar la portada de parque corregida, sus47 fichas, fotos/planos originales, atribución completa, filtros y un solo mapa Leaflet por página. Mantener JavaScript sin framework y los dos HTML autónomos. Nuevos módulos `rider/` encapsulan datos y vistas; los controladores existentes proporcionan catálogo, geografía, selección, planos y GPS. El mapa/GPS no se reemplazan por el SVG del prototipo.

El diseño de cada HTML/PNG del ZIP es la referencia para jerarquía, proporciones, tarjetas, iconos, colores y responsive. Marca bikeride y Sora/Inter locales. Las fotos ilustrativas se sustituyen por recortes del plano original que exigió el usuario. No copiar nombres/personas/estadísticas del ejemplo; usar los catálogos y estados vacíos. Faltan fuentes de altimetría, obstáculos, patrulla, clima y sentidos: mostrar el mismo tipo de sección con falta de datos explícita, sin curvas o valores inventados.

## Funciones de este cierre

- Explorador por parque con búsqueda, filtros de tipo/dificultad y longitud/cercanía existentes, favorito persistente, destacado procedente del catálogo y acceso a detalle/mapa/GPX. Mantener selección de parque y todos los senderos, sin reasignar nombres o conexiones.
- Detalle técnico con título/dificultad/longitudes OSM y PDF separadas, recorte oficial ampliable, procedencia/restricciones, favorito, GPX real por segmentos geográficos y abrir mapa/GPS. Perfil altimétrico/obstáculos permanecen sin datos; no dibujar un perfil ficticio.
- Perfil local con alias opcional, estadísticas de actividades realmente grabadas, archivos GPX guardados localmente y garaje editable. Bicicletas/presiones/notas/fecha de servicio son datos introducidos por el usuario, no recomendaciones. Perfil inicial vacío, avatar simbólico. Historial permite ver/borrar/exportar una actividad local. No cuentas ni sincronización.
- Encuentros distingue servicios documentados (sin coordenadas exactas ni disponibilidad inventadas) y agenda personal editable/cancelable/borrable. Exportar calendario real. No inscripciones ni participantes compartidos. Etiquetas "Agenda personal"/"Guardado en este dispositivo".
- Mapa en ruta sobre el mismo Leaflet: ubicación voluntaria, precisión/antigüedad/pista probable/ambigüedad y demo pública existente. Registrar una actividad requiere botón explícito e informa que se guarda localmente; consulta GPS y demo no graban. Pausa/reanuda/finaliza; tiempo y distancia GPS estimada reales; huecos/lecturas antiguas/imprecisas/jumps no se suman como trayectos. No distancia restante por red ni indicaciones de giro hasta validar red.
- GPX guardado es un archivo de trazado; no equivale a mapa base offline. Beacon/SOS, satélite/3D, auto-pausa no implementada, satélites, reservas y servicios externos deben indicar pendiente/indisponible, nunca activo por defecto. No llamar ni compartir ubicación a terceros.

## Persistencia y contratos de datos

Base IndexedDB nueva `bikeride-local-v1`, almacén `state`, clave `current`. No modificar `mapas-gps-v1`, `maps`, localStorage ni el service worker. Esquema1:

`{version:1,profile:{name:''},favorites:[],bikes:[],meetups:[],activities:[],downloads:[]}`

IDs de catálogo y registros son cadenas seguras; favoritos `{parkId,trailId}`. Bicicleta `{id,name,frontPsi:null|number,rearPsi:null|number,forkModel:'',notes:'',serviceDate:''|YYYY-MM-DD}`. Encuentro `{id,title,parkId,trailId:null|string,meetingPoint:'',startAt:ISO,timezone:'',status:'planned'|'cancelled',notes:''}`. Descarga `{id,parkId,trailId,createdAt:number,name,gpx:string}`. Actividad `{id,parkId,bikeId:null|string,startedAt:number,endedAt:number|null,durationMs:number,distanceM:number,maxSpeedMps:number|null,status:'recording'|'paused'|'finished'|'interrupted',segments:Fix[][]}`; Fix `{longitude,latitude,accuracy,timestamp,speed?:number|null}`.

`openRiderStore({indexedDB=globalThis.indexedDB,name='bikeride-local-v1'}={})` devuelve Promise de `{read(),update(mutator),close()}`. `update` recibe un borrador en una transacción atómica, valida y devuelve el estado nuevo; error de almacenamiento nunca se presenta como guardado. `defaultRiderState()`/`validateRiderState(value)` son puros. Limitar longitudes de texto y rechazar números/coordenadas/fechas inválidos sin perder el valor anterior; no truncar silenciosamente actividad guardada.

`buildGpx({name,segments,description=''})` produce XML GPX1.1 escapado. Segmentos de puntos `{longitude,latitude,timestamp?}`. Cada vía OSM identificada es un trkseg independiente; no unir huecos, invertir recorridos, añadir giros ni exportar el cartel aproximado como geografía. `meetupCalendar(meetup)` produce ICS con UTC/escape correcto, sin enviar invitaciones.

`createRideRecorder({now=Date.now}={})` devuelve `start({id,parkId,bikeId:null},time)`, `ingest(fix)`, `pause(time)`, `resume(time)`, `snapshot(time)`, `finish(time,status='finished')`. Timestamps en ms. Rechazar precisión>45m, antigüedad>10s, futuro>5s, orden temporal no creciente y velocidad geométrica>25m/s. Hueco>30s, pausa o lectura descartada abre nuevo segmento; no sumar un puente. Distancia haversine; pasos menores que max(3m,min(precisión actual,anterior)*0.5) no acumulan jitter. Snapshot incluye sólo tiempo activo, segmentos aceptados y métricas estimadas; sin altimetría inventada. La demo se excluye desde el consumidor por modo y no se ofrece como actividad propia.

La UI guarda checkpoints coalescidos (máximo cada5s), al pausar/finalizar/cambiar vista. Al recargar, drafts recording/paused se conservan como interrumpidos y no reinician GPS. No prometer grabación con pantalla bloqueada ni recuperación de datos aún no confirmados en almacenamiento.

## Navegación e integración

Hashes conservan `parque`; `vista=parque|rutas|detalle|perfil|encuentros|mapa`, `sendero=<id>` y `mapa=1` sólo para mapa. La portada actual sin `vista` sigue válida. Volver/cerrar y entradas directas funcionan repetidamente, sin duplicar listeners/DOM ni mezclar parques. Las nuevas vistas son hermanas de #park-view, con clases propias; no duplicar `.trail-card`, IDs ni controles originales.

Módulo UI `setupCyclingViews({directory,catalog,getGeo,getPreview,actions})` devuelve `{navigate(view,targetId?,replace?),syncRoute(),refreshData(),connectGps(gps),dispose()}`. `actions.routeChanged()` concilia el controlador después de pushState; `openOfficial(targetId)` abre el plano; `selectTrail(targetId)` selecciona al abrir el mapa. La UI puede instalar store/recorder internamente. `getPreview(id)` devuelve `{node,kind,label}` o null: clona sólo el SVG/imagen oficial actual para ese sendero, sin IDs duplicados. kind distingue route, document-crop, document-reference y general; una referencia en tabla no se presenta como trazado. `syncRoute()` lee hash, muestra vista y no modifica historia ni llama routeChanged; `navigate(view,targetId,replace=false)` interno modifica historia, llama routeChanged y syncRoute. Los controladores llaman syncRoute al final de su propia conciliación. Cambio de parque usa las entradas existentes.

GPS añade sólo `snapshot():{mode,result}` y `subscribe(fn):unsubscribe` a su retorno; publica cuando cambia el resultado/modo. No crea otro watch. La UI conecta con ese objeto y usa los controles actuales para iniciar/detener/centrar. Los paneles nuevos entran en `gpsViewport`/ResizeObserver y no cubren posición, precisión, atribución ni acciones. Evitar esconder controles originales sin una vía visible de acceso; adaptar pruebas a la nueva vía real cuando corresponda.

## Comprobación y publicación

TDD para los módulos y comportamientos nuevos. IndexedDB real: recarga, errores y conservación de datos anteriores. GPX/ICS: archivos descargables parseables, segmentos/escape/coordenadas comprobados. Móvil320/390/544,390×844 y horizontal844×390; fuentes/datos de ambos parques, rutas directas/volver/cerrar/repetidas y GPS voluntario. Capturas comparativas al mismo viewport por pantalla, inspección real de píxeles y corrección iterativa. No confundir pruebas públicas simuladas con GPS en terreno.

Construir y ejecutar suite en copia aislada para conservar dist privado anterior. Fuentes/ZIP/foto privados fuera de Git. Publicar únicamente en el Site privado existente manteniendo dueño/audiencia, conforme autorización vigente; nunca main de GitHub. Agrupar al final lo que requiere fuente/servicio/decisión externa. No detener lo local esperando esas decisiones.
