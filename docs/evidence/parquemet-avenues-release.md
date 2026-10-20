# Entrega privada: avenidas de Parquemet

2026-10-20. Código `701880c`, rama `fix/parquemet-avenues`, [PR #9 en borrador](https://github.com/rodracruz/mapas-gps/pull/9) apilado sobre #8. Worktree `parquemet-coverage` conservado. [Implementación, fuentes, limitaciones y pruebas](parquemet-avenues.md).

Vista privada del propietario: https://mapas-gps-revision-durazno.rodracruz.chatgpt.site/parquemet#parque=parquemet . Selector «Avenidas» en fichas y mapa. No es una publicación en GitHub Pages.

Sites confirmó `succeeded`, versión15, proyecto `appgprj_6ad51f7eb4a08191bf1159e60380c2d4`, versión `appgprj_6ad51f7eb4a08191bf1159e60380c2d4~appgver_f1a1901034488191ad5065be5769922a`, despliegue `appgdep_6ad7c83dc97481919bc6c491b5b3dcb0`. Fuente privada `38e697f3305d7ec830425f6a007ad87269b688e3`. Audiencia preservada: un propietario, cero grupos/invitados externos.

HTML ejecutable probado:

| Archivo | Bytes | SHA256 |
|---|---:|---|
| index.html | 3407168 | `d5a0217a399ec4a966440e7104ab1e130533e8e1fbd22a673eed99538668cd27` |
| parquemet.html | 1357893 | `ade4868f016cca3fb772654c74cb836b9095c66604d7e92c46df0c6324ac66e2` |

El ZIP privado `/downloads/mapas-gps-todos-senderos.zip` incluye los HTML actualizados, imagen/PDF originales, datos editables, fuente anterior y metodología. 12.623.892 bytes; SHA256 `d1479272fe7265a6f0f919acdbb9ce929e97cfea719de853fa3c0e6e5fbac7fc`. Conserva la fotografía privada de El Durazno y no se incluye en Git público.

Para ejecución local: `python3 -m http.server 4181 --bind 127.0.0.1` desde el repositorio; abrir `http://127.0.0.1:4181/parquemet.html#parque=parquemet` en esa misma máquina. La URL local devolvió HTTP200 durante QA; el servidor temporal se detiene al terminar. El fondo OSM requiere conexión.

Main/Pages permanece en `87edc6c9f8097a9eb34cfc1f7e955a74edfe3ab9`. Sin force-push ni merge. No se suben ubicaciones, recorridos o fotografías privadas al PR.

Verificación sobre HTTPS desplegado completada: 17 comprobaciones, sin errores de ejecución. Se comprobaron los SHA256 exactos de ambos HTML, las53vías de avenidas al filtrar, doce fichas, diez recortes y dos referencias tabulares; restricciones y selección/ampliación; los14recorridos anteriores, navegación entre parques, El Durazno, fotografía privada intacta y GPS con datos públicos simulados. Visitante anónimo recibe HTTP401. ZIP autenticado devuelve HTTP200 y coincide byte por byte con el archivo probado. [Registro](parquemet-avenues/live-verification.json), [mapa servido](parquemet-avenues/live-world.png), [ficha servida](parquemet-avenues/live-card.png), [recorte servido](parquemet-avenues/live-original-crop.png).
