# SUDA Bike Trails: alcance de integración

2026-10-23. Base funcional del repositorio: `31e5c69`, sin cambios de producto en esta preparación. El usuario eligió la segunda iteración de su proyecto de Stitch y autorizó incorporar el trabajo actual y las propuestas de ese diseño.

## Identificación del diseño

La iteración de ciclismo contiene pantallas **SUDA Bike Mapa GPS**, **SUDA Bike Rutas**, **SUDA Bike Perfil** y **SUDA Bike Encuentros**. El historial describe rutas offline, Mi Garaje & Calibración y Beacon de Seguridad en vivo, y después un detalle técnico de sendero.

Stitch no presenta una etiqueta numérica inequívoca de versión 2. La segunda agrupación horizontal llamada Expeditions es un módulo funcional, no evidencia suficiente de una segunda iteración. Para la revisión se tomó el conjunto de ciclismo descrito por el usuario y el historial, conservando los originales. El proyecto, enlaces de acceso y reportes completos permanecen en la conversación/artefactos privados, fuera de Git público.

## Lo existente frente a las propuestas

| Área | Base Mapas GPS | Propuesta de SUDA pendiente de integración funcional |
|---|---|---|
| Parques y rutas | El Durazno 21 fichas; Parquemet 26; fuentes y geometrías identificadas | Nueva presentación y navegación del modelo SUDA |
| Tarjetas y planos | Curva sobre recorte del plano original, ampliación y comparación | Adaptar componentes visuales manteniendo coordenadas y fuentes |
| Filtros | Tipo según fuente, longitud OSM, cercanía puntual y dificultad documentada | Estilo SUDA para los mismos filtros y estados |
| GPS | Activación voluntaria, lectura/precisión/ajuste probable, continuidad, caducidad y parada | Pantalla en ruta con telemetría, auto-pausa, hitos y ajustes ampliados |
| Demo | Una demo pública Lomo Vetado→Calibre12 de 49 lecturas; sólo El Durazno | No se añaden otras demos por el diseño |
| Sin conexión | Datos estáticos/visores existentes según sus recursos; no se afirma disponibilidad total del fondo mundial | Descargas, almacenamiento, sincronización y estados offline, con recursos autorizados para ese uso |
| Capas | Mapa geográfico OSM y planos oficiales diferenciados | Topografía, satélite y 3D dentro del nuevo flujo, sujetos a proveedor e integración |
| Perfil/actividad | La base mantiene mapas y calibraciones locales; no tiene el nuevo servicio de perfil SUDA | Perfil, estadísticas y actividad con datos reales y consentimiento |
| Garaje/calibración | Calibración de imágenes en la aplicación anterior | Registro de bicicleta, PSI con referencias del fabricante y mantenimiento |
| Encuentros | No existe un servicio de quedadas en la base | Listado/detalle, participación y estados de eventos; no se envían invitaciones por diseñarlos |
| Beacon | La base no comparte ubicación ni registra trazas personales | Contactos, activación explícita, sesión compartida y detener; requiere integración y permisos propios |
| Detalle técnico | Ficha de recorrido y campos documentados; datos faltantes explícitos | Perfil altimétrico, peraltes, saltos, drops, rockgardens y terreno con fuentes comprobadas |
| Expediciones/alquileres | No hay reservas, inventario ni pagos reales | Mantener las propuestas de esa iteración como flujos de diseño, sin transacciones reales |
| Destinos/loops | No hay motor de navegación completo validado | Distancias por red, destinos y circuitos requieren comprobar conexiones, accesos y sentidos |

## Datos contrastados durante la revisión

- El Durazno: **Trail 8, Park 12, Subida 1**. Dificultades: Principiante 4, Intermedio 6, Avanzado 4, Experto 6 y una subida sin dificultad documentada.
- Parquemet: **Sendero ciclista 8, Paseo compartido 6, Avenida 11, Camino 1**. Sus 26 fichas carecen de dificultad documentada; el filtro se deshabilita con explicación.
- Las etiquetas DH/XC/Vehicular o Doble Negro no sustituyen estas categorías sin nueva evidencia.
- Sólo existe la demo de 49 lecturas. Otros contadores visuales no acreditan demos adicionales.
- Una barra de navegación, un icono Offline o una ficha de perfil presente en el modelo de Stitch no convierte esas propuestas en funciones implementadas en el repositorio.

## Contrato y verificaciones al integrar código

[Contrato de controles y rutas](CONTRATO-INTEGRACION.json): 83 IDs estáticos en El Durazno y 73 en Parquemet; 21 y 26 IDs de fichas respectivamente. Mantener los IDs o adaptar explícitamente su correspondencia. Conservar el mismo nodo del mapa al filtrar y los motores de geografía y coincidencia existentes.

Toda nueva barra o panel fijo del modelo debe entrar en el cálculo de espacio visible del GPS; no debe tapar el punto, el aro, la precisión ni los controles. Conservar giro de pantalla, arrastre/recentrado, pérdida de señal, permiso rechazado y detención al cerrar. No convertir las coordenadas visuales del cartel en coordenadas geográficas para aparentar navegación.

Las pruebas históricas de la base y su despliegue son del 2026-10-21. Esta preparación contrasta catálogos e interfaces, no repite pruebas de terreno ni acredita que el nuevo diseño ya esté integrado. Al incorporar código se deben ejecutar las pruebas GPS/datos/móvil, comprobar fuentes y comparar un mapa guardado con calibración antes/después.
