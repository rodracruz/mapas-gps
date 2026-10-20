# Publicación privada: fondos del plano original en las rutas

2026-10-20. Código `d31b33e347dbfa11123e5073d4e3fd341b19a329`, rama `fix/official-map-preview-background`. [PR #7 en borrador](https://github.com/rodracruz/mapas-gps/pull/7), apilado sobre #6. Worktree `parquemet-coverage` conservado.

URL comprobada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/parquemet#parque=parquemet . Versión13 `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_ed801d5c08348191aed9ecd431e152a5`, despliegue `appgdep_6ad7b73ce9648191acd8f42e6b01cbd2`, `succeeded`. Fuente privada de hosting `3ea5649d37e8a6938962092435815e9adf6fc025`.

Se mantiene la audiencia owner-private: un propietario, cero grupos o visitantes externos; acceso anónimo401. Credenciales de fuente y QA sólo por stdin oculto/memoria; ningún secreto en archivos o Git.

- HTML principal3.402.196bytes SHA256 `f74a1a985b601080d682d763dba8de4bde0179bd7b8c5944932234fe442eee2e`.
- Parquemet967.421bytes SHA256 `5af078de7e957b0a3838cdf6d81107f21fcead890beeaa2ecf9a21ebb9b52941`.
- Ambos hashes coinciden con las respuestas HTTPS del sitio desplegado.
- ZIP privado `/downloads/mapas-gps-todos-senderos.zip`: respuesta200,12.419.010bytes SHA256 `34f4e0e74cf7e2dc96ec4f23e600865f83400461f89ed52217d75f934e69b2f1`, idéntico al archivo local. Incluye la foto privada anterior en el bundle; nunca subir a Git público.
- Archivo de despliegue24.080.561bytes SHA256 `6d4f2be9b07af8762a22da95e42bdaa7d179d2297ea272b298037158ee363254`.

Prueba real del sitio en Chromium móvil390×844: veinte fondos oficiales El Durazno y ocho Parquemet, apertura ampliada con plano visible a100%, encuadre del sendero, mapas y curvas alineados, controles y selección, retorno entre parques y cero errores de ejecución. Se conservan las fuentes oficiales de alta resolución y la foto privada original960×1280; la revisión fotográfica anterior sigue accesible. La regresión en vivo también comprobó la demo pública/GPS con posiciones públicas emuladas por CDP y cancelación, sin afirmar validación de terreno. [Recibo sin secretos](map-preview-background/live-verification.json).

Capturas verificadas: [ficha Parquemet](map-preview-background/live-parquemet-card.png), [ampliación Parquemet](map-preview-background/live-parquemet-enlarged.png), [ficha El Durazno](map-preview-background/live-el-durazno-card.png), [ampliación El Durazno](map-preview-background/live-el-durazno-enlarged.png). [Método y pruebas fuente/bundle](map-preview-background.md).

`main`/Pages permanecen en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`. No se modifica la geometría ni se atribuye posición GPS al plano esquemático de Parquemet.
