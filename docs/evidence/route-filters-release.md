# Entrega privada de los cuatro filtros

2026-10-20. Código `a86a395`, rama `feat/park-route-filters`, [PR #10 en borrador](https://github.com/rodracruz/mapas-gps/pull/10) sobre #9. Worktree `parquemet-coverage` conservado. [Funcionamiento, pruebas, límites y capturas](route-filters.md).

Vista privada: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/parquemet#parque=parquemet . Los filtros también están disponibles en El Durazno. Se mantienen el origen y el selector entre parques; no es GitHub Pages.

Sites confirmó `succeeded`, versión16, proyecto `appgprj_6ad51f7eb4a08191bf1159e60380c2d4`, versión `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_41709d7390b08191ae437b094abb4e48`, despliegue `appgdep_6ad7ccbc3b5c81918188ad04df5a3875`. Fuente privada `488cb6705318bebb9ce3366ea0047b4aab627ab8`. Audiencia preservada: un propietario, cero grupos y visitantes externos.

Artefactos ejecutables probados antes de desplegar:

| Archivo | Bytes | SHA256 |
|---|---:|---|
| index.html | 3424055 | `46dc28d783c82055cb3955b34ad524ba37797f2495c73d05474d0b85bef7454c` |
| parquemet.html | 1372304 | `c4d31e6a019f1a8edb14f92ea55a71d7a02b9a82a63d815d783bc99a918ad963` |

ZIP privado `/downloads/mapas-gps-todos-senderos.zip`: 12.635.463 bytes, SHA256 `982476ac6ad74919e47b5f786c288b744f6471dc73d5e58ba0af78066a36c728`. Incluye el código ejecutable actualizado y `FILTROS.md`, conserva los datos editables, las fuentes y la foto privada. No se incluye en Git público.

Desarrollo local: `python3 -m http.server 4182 --bind 127.0.0.1` desde el repositorio; abrir `http://127.0.0.1:4182/parquemet.html#parque=parquemet` en esa máquina. El servidor temporal de QA se detiene al terminar; la URL privada es el resultado accesible.

Main/Pages permanece en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`; sin merge ni force-push. Ninguna ubicación real se incorpora a código, fuentes, capturas o servidor. Las pruebas de cercanía y GPS usan posiciones públicas simuladas.

Verificación en HTTPS completada: 17 comprobaciones, sin errores de ejecución. Ambos HTML coinciden exactamente con los SHA256 probados. Se comprobaron el nodo y cámara del mapa al filtrar en pantalla completa y su posición/tamaño en portada, Avenida/Camino, ordenación, lectura puntual de cercanía sin activar seguimiento y dificultad deshabilitada cuando falta. En El Durazno se combinó Trail + Intermedio y resultaron Starwars/Cactus. Se conservaron curvas y fondos oficiales, selección y fuentes separadas, GPS público simulado, fotografía privada y retorno entre parques. Visitante anónimo recibe HTTP401; ZIP autenticado HTTP200 con el SHA256 esperado.

[Registro servido](route-filters/live-verification.json), [filtros y mapa en portada](route-filters/live-home.png), [cercanía en el panel](route-filters/live-panel.png), [capas filtradas](route-filters/live-world.png), [El Durazno filtrado](route-filters/live-durazno.png). Los datos de posición de QA son públicos y simulados; no se prueban navegación ni accesos de campo.
