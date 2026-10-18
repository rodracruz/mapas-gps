# Foto completa recibida: 81184.jpg

Fecha de recepción y consulta: 2026-10-18. Se inspeccionó el archivo real y sus dimensiones, sin ampliación generativa.

| Fuente | Dimensiones nativas | Bytes | Uso |
| --- | --- | --- | --- |
| Nueva fotografía completa `81184.jpg` | 960 × 1280 | 177187 | Contraste del cartel completo, leyenda, iconos y edición visual |
| Foto del repositorio `elh-durazno.jpg` | 900 × 1100 | 453793 | Plano de referencia de los trazados, conservado intacto |
| JPG oficial de Outlife | 2570 × 3077 | 4739485 | Fuente de mayor detalle; original conservado |
| Fondo oficial alineado | 1800 × 2200 | 1685997 | Nueva imagen de revisión a doble densidad de píxel, en el mismo plano 900 × 1100 |

SHA-256 de la nueva foto: `c6391281460cc5c6ad65d61069bd310bdd1dd64b8fedbb4d2c12d81898668fb9`. No contiene orientación EXIF. Se conserva su copia exacta fuera del repositorio público, en el almacén privado de fuentes del entorno. Solo se incrusta en la copia de alojamiento con acceso exclusivo del propietario; su binario no forma parte de la rama pública de GitHub.

## Qué aporta

La foto nueva contiene el cartel completo y su marco, árboles y parte del suelo. El área principal de mapa, excluyendo columna de progresión, leyenda y marco, ocupa aproximadamente 760 × 950 px; es una estimación de encuadre, no una medición de terreno. Por tanto, el tamaño 960 × 1280 del archivo no significa que las líneas tengan más detalle que en el recorte anterior de 900 × 1100.

Se revisaron los tres nombres en la columna de progresión (Starwars, La Virgen y Lomo Vetado) y sus rótulos dentro del mapa. La subida roja, Cebolla negra, inserto del centro de operaciones, lista de dificultades y distribución de los trazados concuerdan visualmente con la fuente oficial utilizada. Esto refuerza la compatibilidad de contenido. La fecha o número de edición del cartel fotografiado siguen sin estar acreditados.

Las letras y placas siguen cubriendo partes del eje. La foto completa no revela tramos ocultos bajo esos rótulos ni prueba conexiones transitables. No se cierran zonas pendientes a partir de esta imagen ni se cambia su confianza geográfica.

## Mejora del visor

Se añade elección entre el mapa oficial de mayor detalle y la foto de revisión. Ambos se representan en exactamente el mismo plano de imagen 900 × 1100 que ya usa la geometría; cambiar el fondo conserva puntos, zoom y desplazamiento.

El fondo oficial es un raster derivado de 1800 × 2200. Se obtiene con `scripts/prepare-review-images.py`, usando `diag(2,2,1) × H`, donde H es la homografía visual ya guardada en `data/el-durazno/image-registration.json`. Se aplica interpolación bilineal (`cv2.INTER_LINEAR`) y JPEG calidad 95. No se usa IA generativa, no se rellenan huecos ni se modifican las curvas. La imagen oficial nativa sigue disponible en `sources/el-durazno-official-2022.jpg` y se usa además el PDF vectorial conservado como fuente investigativa.

La imagen derivada se muestra mediante un elemento SVG de ancho 900 y alto 1100; cada píxel de coordenada contiene 2 × 2 píxeles del raster. Los vectores no se recalculan ni se georreferencian. La tolerancia de simplificación sigue expresada en píxeles del plano original.

La foto nueva puede abrirse completa dentro del visor privado, sin rectificar y sin superponerle coordenadas de otra imagen. Se muestran sus dimensiones reales. No se le atribuye una calibración GPS.

## Verificación de esta actualización

- Integridad de las imágenes por SHA-256, dimensiones declaradas y escala respecto al plano de coordenadas.
- Cambio entre fuentes conservando puntos y `viewBox`, también en móvil emulado.
- Error de carga de una fuente conserva el fondo anterior validado y explica el problema.
- HTML autónomo verifica las dos fuentes y la foto completa, sin solicitudes externas.
- Se conserva la geometría y la separación entre dibujo y geografía. Los archivos de la app anterior y sus almacenes no se modifican.

La verificación publicada se registra tras desplegar esta actualización en el mismo sitio privado.

Publicación comprobada: mismo sitio privado, despliegue `appgdep_6ad523fb1018819181d220cfc9cc9f6a`. Las 11 comprobaciones remotas finalizaron sin errores; incluyeron imagen oficial de mayor detalle, cambio de fondo sin desplazar vectores y apertura de la foto recibida con su SHA original. Resultados: [private-site-verification.json](private-site-verification.json).
