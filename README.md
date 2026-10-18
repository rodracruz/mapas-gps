# Mapas GPS · Senderos

Aplicación web móvil para posicionarse con GPS sobre imágenes de mapas de senderos.

### Probar
- Abre `https://<usuario>.github.io/<repo>/` (tras activar Pages) desde Android en Chrome.
- Abre `RKF El Durazno` o importa una imagen JPG/PNG/WebP.
- Pulsa **Calibrar** y marca un punto reconocible en la foto; elige sus coordenadas reales en OpenStreetMap, de forma manual o usando GPS sobre el terreno. Repite con 4+ puntos distribuidos.
- Activa GPS para ver tu posición azul.

### Publicación en GitHub Pages
Abre el repositorio en GitHub → **Settings** → **Pages** → **Build and deployment** → Source: **Deploy from a branch** → Branch: **main**, folder **/(root)** → **Save**. Espera a que GitHub publique y recarga la dirección indicada.

### Privacidad y seguridad
Fotos, puntos de control y GPS se procesan localmente; solo OpenStreetMap carga mosaicos de referencia online durante calibración. La PWA requiere HTTPS. Prototipo experimental no validado para seguridad de navegación en terreno.
