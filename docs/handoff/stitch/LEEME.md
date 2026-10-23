# Mapas GPS para Stitch

Base inspeccionada: `31e5c698dd00f3e8ea8f0a7641c6a709a4d93b9f` (`test/gps-validation`),2026-10-23. El proyecto/modelo de Stitch y sus propuestas todavía no se han compartido en este hilo. Este paquete prepara lo existente para ese modelo; las propuestas concretas se completan al recibir su enlace o exportación.

## Cómo pasarlo

1. Descomprimir el ZIP. En el proyecto existente de Stitch, adjuntar las capturas numeradas que acepte su interfaz, empezando por portada/filtros, mapa y GPS. Las capturas conservan su resolución original.
2. Copiar el contenido de `PROMPT-PARA-STITCH.txt` en el chat de ese mismo proyecto.
3. Añadir `FUNCIONES.md` y `catalogos.json` si la interfaz admite esos archivos; también puede copiarse su contenido al chat.
4. El paquete incluye `app/` ejecutable y `codigo/` como referencias de implementación. No se presupone que Stitch pueda importar un ZIP, ejecutar la aplicación o leer todas sus dependencias automáticamente. Esas carpetas sirven también para integrar después su resultado aquí.

El modelo de Stitch define el diseño visual. Capturas y código definen el comportamiento existente. Las nuevas propuestas se representan con sus pantallas/estados y se incorporan después al desarrollo verificable de la app.

## Abrir la referencia ejecutable

Desde la carpeta descomprimida:

```sh
python3 -m http.server 4187 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:4187/app/index.html` en la misma máquina. El enlace es local; no da acceso al ordenador desde Stitch. La carpeta `app/` contiene datos y código incrustados; las imágenes oficiales están en `app/sources/` y el mapa base OSM requiere internet. Geolocalización requiere HTTPS o localhost y permiso del navegador.

La vista alojada del propietario es https://mapas-gps-revision-durazno.rodracruz.chatgpt.site . Mantiene acceso privado y no debe darse por legible desde Stitch. El código público exacto se puede consultar en https://github.com/rodracruz/mapas-gps/tree/31e5c698dd00f3e8ea8f0a7641c6a709a4d93b9f .

## Contenido y fuentes

- `capturas/`: pantallas históricas verificadas del producto, numeradas; algunas muestran una etapa anterior a las últimas correcciones. `capturas.json` identifica su fuente y alcance. Las capturas GPS usan posiciones públicas simuladas, nunca una salida personal.
- `FUNCIONES.md`: matriz de funciones y estados que hay que conservar, ampliaciones previstas y módulos de referencia.
- `catalogos.json`: nombres, IDs, categorías y datos documentados de ambos parques.
- `codigo/`: archivos públicos de la base exacta; se omiten las capturas históricas voluminosas de `docs/`, que siguen disponibles en GitHub. Incluye código, geometrías, fuentes públicas y pruebas.
- `app/`: nueva construcción pública de esa base, sin incorporar el adjunto fotográfico privado.
- `manifest.json`: archivos, tamaños, SHA256 y verificación de integridad.

La foto privada que el usuario aportó sigue en la app privada; este paquete usa los originales oficiales públicos. Las fuentes conservan sus atribuciones y condiciones de reutilización. Nunca se incluyen credenciales, almacenamiento del navegador ni trazas personales. La geometría visual conserva coordenadas de imagen y la geográfica conserva OSM; no se crean conexiones ni nuevas coordenadas para el diseño.

La base documenta130 pruebas pasadas y pruebas móviles/HTTPS realizadas el2026-10-21. En esta entrega documental se comprueba la construcción pública y la integridad del paquete; no se afirma haber repetido pruebas físicas ni validado las nuevas propuestas de Stitch.
