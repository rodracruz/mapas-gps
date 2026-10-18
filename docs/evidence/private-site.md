# Acceso directo al primer hito

Publicación privada autorizada por el usuario al pedir una entrega que pueda abrir directamente, sin descargas ni comandos. Fecha: 2026-10-18.

URL: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site

Es una copia alojada y privada en Sites. La política de acceso comprobada contiene únicamente al propietario, sin grupos. Un visitante sin sesión recibe la pantalla «Continue with ChatGPT» (HTTP 401); debe entrar con la misma cuenta propietaria. No se cambió la audiencia a pública.

## Procedencia

- Código de Mapas GPS: rama `feat/fiel-vector-review`, commit `287f505`.
- Copia de alojamiento separada: `/workspace/sites/mapas-gps-revision`.
- Proyecto Sites: `appgprj_6ad51f7eb4a08191bf1159e60380c2d4`.
- Commit de la copia publicada: `e6600c879f2c577c79358b00148c0a6a8d80d8d2`.
- Versión: 1.
- Despliegue: `appgdep_6ad51fd195a481918fef45786e85145a`, estado `succeeded`.
- SHA-256 del HTML publicado y del autónomo ya probado: `31a76e751463e2782d3158e54c8587088a3c29d51313beef61a1129eac6d0209`.

La copia contiene el HTML autónomo íntegro y la fotografía pública original incrustada. No se añadió almacenamiento de posiciones, trazas personales, servicios de pago ni claves. GitHub Pages y main de `rodracruz/mapas-gps` permanecen sin cambios.

## Comprobación del sitio publicado

Se abrió realmente la URL HTTPS en Chromium con acceso de QA existente del propio sitio, conservado solo en memoria. No se generaron ni se publicaron tokens. Se comprobó:

1. HTTP 200 con acceso autorizado y cuerpo idéntico por hash al artefacto probado.
2. Carga de la fotografía y los 9 fragmentos con 7 zonas pendientes.
3. Selección y encuadre de sendero.
4. Modos solo vectores y superposición.
5. Transformación compartida de foto y vectores después de zoom.
6. Carga, disposición y selección táctil en móvil emulado de 390 × 844.
7. Ausencia de errores JavaScript.
8. Acceso sin sesión limitado a la pantalla de inicio de sesión, sin mostrar el mapa.

Resultados: [private-site-verification.json](private-site-verification.json). Las capturas de esta comprobación están en `/workspace/artifacts/mapas-gps-vista-privada-escritorio.png` y `mapas-gps-vista-privada-movil.png`.

El helper de publicación descrito por la skill Sites no estaba instalado ni disponible en los recursos. Se preparó una copia estática equivalente, se pasó la credencial por stdin con eco desactivado, se aplicó al proceso Git solo en memoria, se verificó el commit remoto y se empaquetaron únicamente `.openai/hosting.json` y `dist/`. No se persistieron credenciales. Se reutiliza este mismo ID para futuras actualizaciones, sin crear otro sitio.

La publicación resuelve el acceso directo. No cambia las limitaciones cartográficas: las zonas pendientes y la georreferenciación no validada siguen indicadas en el visor.
