# Mapa de portada legible

Corrección solicitada por el propietario después del hito de todos los senderos. Continúa en `feat/all-trails-from-sign` y PR#3, sin modificar main.

La portada anterior sustituía el JPG oficial2570×3077 por la foto privada960×1280 y mostraba todo el cartel con `object-fit:contain` en245px de alto. En móvil, el dibujo se reducía a una miniatura estrecha. Ahora usa la fuente oficial de mayor resolución ya contrastada, identificada como «Mapa oficial en alta resolución», y enfoca el mapa a todo el ancho. La fotografía privada conserva exactamente sus bytes, huella y dimensiones, accesible mediante «Ver tu fotografía original».

El encuadre es exclusivamente de presentación: rectángulo en píxeles nativos `(x580,y0,ancho1990,alto2500)`. Excluye la columna lateral de dificultades y la leyenda inferior, conservando los extremos de los trazados. El archivo fuente no se recorta, interpola, amplía de forma generativa ni reemplaza. La imagen, su hash y todos los datos vectoriales permanecen intactos. La tarjeta crece proporcionalmente a su anchura, sin franjas laterales. «Ampliar mapa» abre el mismo visor en modo Cartel, sobre ese rectángulo; se puede acercar, desplazar y volver a ver el cartel completo. «Ver todos los senderos del cartel» sigue abriendo la superposición.

Se inspeccionó la captura móvil corregida. `tests/park-image-browser.mjs` detectó primero la fuente incorrecta960×1280; después comprobó2570×3077, área nativa de encuadre a320/390/768px, ausencia de desborde horizontal, ampliación y zoom, y preservación de la foto privada original. También se ejecutan39 pruebas unitarias, los controles de todos los senderos, gestos, recuperación de fondo y aceptación geográfica. Son pruebas en Chromium con emulación móvil, no en teléfono físico.

Para construir la copia privada, se mantiene `scripts/build-geographic-standalone.py --reference-photo /ruta/privada/81184.jpg`. El argumento guarda el original en los datos privados del ejecutable; no sobrescribe la imagen de portada. El directorio `dist/sources` debe acompañar el HTML. No añadir el ejecutable o el adjunto privado a GitHub.
