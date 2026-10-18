# Acceso directo al primer hito

Publicación privada autorizada por el usuario al pedir una entrega que pueda abrir directamente, sin descargas ni comandos. Fecha: 2026-10-18.

URL: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site

Es una copia alojada y privada en Sites. La política de acceso comprobada contiene únicamente al propietario, sin grupos. Un visitante sin sesión recibe la pantalla «Continue with ChatGPT» (HTTP 401); debe entrar con la misma cuenta propietaria. No se cambió la audiencia a pública.

## Versión actual: revisión directa de siete zonas

Código de la app: `98e2505626c6f33065c483f1e6d479fb35cadf61`, subido a `feat/fiel-vector-review` y al PR #1 en borrador. Copia privada de alojamiento: `d620d5cef5521cc7b8dd04783b3fcd5c8e8c6657`. Despliegue `appgdep_6ad547b8c4e0819183ec9165c4193646`, resultado `succeeded`; versión `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_575d699e5f108191a705a37bdafd23e2`.

HTML publicado SHA-256: `d74e472c0b275ff2723d054ce1ae9be8d5cd900f1dc704b9a5fbaae6baf77340`. La URL HTTPS real pasó **15 comprobaciones** en Chromium el 2026-10-18 a las 22:27 UTC. Se confirmó igualdad con el artefacto probado, selección directa de zona por teclado y tacto, comparación de fondos sin desplazar geometría, números ocultos al ampliar, documentación incrustada y controles móviles de 44 px. También pasaron carga de la foto completa, reintento de decodificación y ausencia de errores JavaScript. El acceso anónimo volvió a devolver HTTP 401.

La audiencia sigue limitada al propietario. `main` público y GitHub Pages no se modificaron. Siguen **9 fragmentos / 245 vértices / 7 pendientes**, sin GPS validado. El registro [private-site-verification.json](private-site-verification.json) corresponde a esta versión; la captura móvil de revisión está en `/workspace/artifacts/mapas-gps-vista-privada-zonas-movil.png`.

## Primera publicación (histórico)

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

## Actualización con la fotografía completa recibida

La copia privada se actualizó con el cambio de fondos y la foto completa. Código de la app: `b734c08`; commit privado publicado: `3419225876770733d47d121061a603f8f1b912f3`. Despliegue `appgdep_6ad523fb1018819181d220cfc9cc9f6a`, resultado `succeeded`, misma URL y acceso del propietario.

HTML publicado SHA-256: `5ef31273a7c3cadbf37e51f47a95d49323d72d8b334f9c76c1b4d201ad36bfd2`. Se abrió realmente el sitio publicado y se comprobó el cuerpo idéntico al artefacto probado, carga de los dos fondos, conservación de geometría/zoom y apertura de la foto completa con dimensiones 960 × 1280 y SHA original `c6391281460cc5c6ad65d61069bd310bdd1dd64b8fedbb4d2c12d81898668fb9`. También pasaron selección, modos, matrices foto/vector y móvil emulado; sin errores de JavaScript. El JSON de verificación enlazado arriba refleja esta última comprobación.

La fotografía permanece fuera de los archivos públicos. Se incrusta solo en el HTML generado con `--reference-photo` que se publica en la copia privada. Su análisis está en [new-photo-81184.md](new-photo-81184.md). La geometría y los siete recuadros pendientes no se alteraron al cambiar la imagen de fondo.

## Actualización de integridad y reintento de foto

Código de aplicación: `74d6c82`; rama subida a GitHub y [PR #1 en borrador](https://github.com/rodracruz/mapas-gps/pull/1). El código y los datos públicos ya son recuperables desde el repositorio original, sin depender del estado del hilo. `main` permanece en `87edc6c`.

Commit privado de alojamiento: `9559612fcc4a644b4c3b91feecffe42885b46230`. Despliegue `appgdep_6ad542f8d0508191bdb922a3d9a5c7e6`, resultado `succeeded`; versión `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_3bd7e631a0bc8191b2dfa8e1eefe0658`. Misma URL y acceso exclusivo del propietario, confirmado nuevamente antes de publicar.

HTML SHA-256 `13aee9afec53b681fa4ebc5db9d23a536a3e87d2d33751de7b10b67181545fee`. La comprobación real del sitio el 2026-10-18 pasó 12 controles, incluidos igualdad de bytes, fondos, geometría, selección, zoom y disposición móvil. Se inyectó además un único fallo transitorio de decodificación en móvil: la URL fallida se revocó y el segundo toque abrió la foto completa de 960 × 1280, sin errores de JavaScript. El acceso anónimo sigue respondiendo HTTP 401. El registro JSON enlazado refleja esta versión.
