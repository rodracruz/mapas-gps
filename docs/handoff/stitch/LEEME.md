# Mapas GPS para Stitch

Base inspeccionada: `31e5c698dd00f3e8ea8f0a7641c6a709a4d93b9f` (`test/gps-validation`), 2026-10-23. El usuario compartió su proyecto de Stitch y eligió la segunda versión. El enlace permanece en la conversación privada. Se envió el encargo al proyecto mediante la sesión autorizada; la revisión derivada se llama **Mapas GPS · Integración SUDA v2**. El código de producto y la vista alojada conservan su versión anterior.

## Material enviado y paquete de referencia

Se pegó el encargo funcional en el chat de Stitch y se proporcionaron enlaces públicos a la base exacta, la matriz de funciones, el contrato y cuatro capturas de referencia. No se afirma una importación binaria del ZIP ni de todas sus dependencias. El catálogo literal de 47 recorridos se añadió al encargo de corrección.

El ZIP conserva el encargo en `PROMPT-PARA-STITCH.txt`, las capturas originales, `FUNCIONES.md`, `catalogos.json`, `app/` ejecutable y `codigo/`. Sirve como referencia de implementación y recuperación; el usuario no necesita volver a cargarlo para completar la entrega ya enviada al proyecto. Las actualizaciones posteriores del directorio documental no están incluidas automáticamente en ese ZIP histórico.

El modelo de Stitch define el diseño visual. Capturas y código definen el comportamiento existente. Las nuevas propuestas se representan con sus pantallas/estados y se incorporan después al desarrollo verificable de la app.

Estado comprobado y límites de la automatización: [ESTADO-STITCH.md](ESTADO-STITCH.md). El encargo está enviado; no se obtuvo todavía una exportación de código verificable.

## Abrir la referencia ejecutable

Desde la carpeta descomprimida:

```sh
python3 -m http.server 4187 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4187/app/index.html` en la misma máquina. El enlace es local; no da acceso al ordenador desde Stitch. La carpeta `app/` contiene datos y código incrustados; las imágenes oficiales están en `app/sources/` y el mapa base OSM requiere internet. Geolocalización requiere HTTPS o localhost y permiso del navegador.

La vista alojada del propietario es https://mapas-gps-revision-durazno.rodracruz.chatgpt.site . Mantiene acceso privado y no debe darse por legible desde Stitch. El código público exacto se puede consultar en https://github.com/rodracruz/mapas-gps/tree/31e5c698dd00f3e8ea8f0a7641c6a709a4d93b9f .

## Contenido y fuentes

- `capturas/`: pantallas históricas verificadas del producto, numeradas; algunas muestran una etapa anterior a las últimas correcciones. `capturas.json` identifica su fuente y alcance. Las capturas GPS usan posiciones públicas simuladas, nunca una salida personal.
- `CONTRATO-INTEGRACION.json`: inventario de 83 controles estáticos de El Durazno y 73 de Parquemet, más sus identificadores de recorridos; conservarlos o entregar una correspondencia al exportar.
- `FUNCIONES.md`: matriz de funciones y estados que hay que conservar, ampliaciones previstas y módulos de referencia.
- `catalogos.json`: nombres, IDs, categorías y datos documentados de ambos parques.
- `CATALOGO-INTERCAMBIO.json`: 47 fichas compactas derivadas del motor actual, con tipo, dificultad y longitud OSM importada; es la referencia literal para detectar datos inventados por el diseño. Las longitudes pueden representar sólo tramos parciales.
- `PROPUESTAS-SUDA.md`: distinción entre funciones existentes, propuestas del diseño y requisitos al integrarlo.
- `codigo/`: archivos públicos de la base exacta; se omiten las capturas históricas voluminosas de `docs/`, que siguen disponibles en GitHub. Incluye código, geometrías, fuentes públicas y pruebas.
- `app/`: nueva construcción pública de esa base, sin incorporar el adjunto fotográfico privado.
- `manifest.json`: archivos, tamaños, SHA256 y verificación de integridad.

La foto privada que el usuario aportó sigue en la app privada; este paquete usa los originales oficiales públicos. Las fuentes conservan sus atribuciones y condiciones de reutilización. Nunca se incluyen credenciales, almacenamiento del navegador ni trazas personales. La geometría visual conserva coordenadas de imagen y la geográfica conserva OSM; no se crean conexiones ni nuevas coordenadas para el diseño.

La base documenta 130 pruebas pasadas y pruebas móviles/HTTPS realizadas el2026-10-21. En esta entrega documental se comprueba la construcción pública y la integridad del paquete; no se afirma haber repetido pruebas físicas ni validado las nuevas propuestas de Stitch.
