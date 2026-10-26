# bikeride: integración del diseño recibido

El usuario autorizó continuar la aplicación existente con el diseño de Stitch y corrigió su marca a **bikeride**, en minúsculas. Ya pidió ejecutar sin repetir preguntas de inicio. Se conserva la arquitectura JavaScript/Leaflet, los mapas guardados y main.

El ZIP adjunto es legible y coincide con el SHA256 `ee1a8c4dbc98642089f14dee7f0ef8cb150bd5d57b6f5b1454f7d59318daae06`. Contiene una pantalla HTML, una imagen544×830 y dos documentos. Se preserva el original fuera de Git. La revisión representada es «Mapas GPS · Integración SUDA v2»; no acredita la historia de la segunda versión original ni contiene una aplicación completa.

## Diseño y enfoque

Aplicar los colores documentados, titulares Sora, texto Inter, superficies tonales, selector horizontal de parque y navegación inferior a los visores funcionales. La marca pasa a bikeride. No se importa el HTML como sustituto de la app: sus cinco tarjetas, coordenadas fijas, velocidades y demos no representan los datos reales. Una reconstrucción independiente de los motores perdería funciones ya comprobadas; reutilizarlos evita esa regresión.

Se conservan21/26 fichas, tipos/dificultades reales, plano original en miniaturas, mapa fijo al filtrar, selección y pantalla completa, fuentes, GPS voluntario y demo pública de49 lecturas sólo en El Durazno. Las nuevas barras no deben tapar el mapa/GPS: la navegación inferior se oculta durante el mapa a pantalla completa.

Mapa GPS y Rutas deben abrir las vistas existentes. Encuentros y Perfil siguen pendientes y se muestran deshabilitados con «Próximamente»; no se crean cuentas, estadísticas ni eventos ficticios. El estado de conexión informa sólo el estado de red del navegador; no afirma sincronización u offline completo. Offline, Beacon, garaje, altimetría y demás propuestas permanecen documentadas como pendientes, sin servicios externos nuevos.

Las fuentes tipográficas se distribuyen localmente con su licencia, también en la construcción autónoma. No se cambian geometrías, identificadores del contrato, almacenamiento, API de compatibilidad, repositorio ni dominios. No se publica en main. Se ejecutan comprobaciones móviles y horizontales, pruebas de regresión de datos/GPS y construcción en una copia aislada para conservar la construcción privada anterior.
