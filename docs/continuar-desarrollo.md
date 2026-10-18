# Continuar Mapas GPS

Estado del trabajo: 2026-10-18. Repositorio: https://github.com/rodracruz/mapas-gps. Rama de desarrollo: `feat/fiel-vector-review`. La aplicación anterior y sus almacenes de mapas permanecen intactos; no fusionar esta rama sobre `main` sin aprobación del propietario.

## Entrega que se está revisando

El primer hito es un visor de revisión de Starwars, La Virgen y Lomo Vetado, no una red navegable. Abrir `revision.html` con un servidor HTTP o el [visor privado alojado](https://mapas-gps-revision-durazno.rodracruz.chatgpt.site). Este alojamiento es independiente de GitHub Pages.

El original público de 900 × 1100 se conserva sin cambios. La fuente oficial de mayor resolución está alineada a ese mismo plano; cambiar de fondo no modifica las coordenadas. La foto completa del usuario se conserva fuera del repositorio público y solo se incluye opcionalmente en la copia privada.

- Datos editables: `data/el-durazno/visual-trails.json`.
- Muestras previas a simplificación: `data/el-durazno/centerline-samples.json`.
- Ajuste visual entre imágenes: `data/el-durazno/image-registration.json`.
- Investigación geográfica separada: `data/el-durazno/geographic-references.json`.
- Método y límites: `docs/evidence/primer-hito.md`.
- Evidencia y pruebas: `docs/evidence/verification.md`.

## Qué protege la carga

El visor admite aquí coordenadas de imagen con transformación identidad. Los extremos de cada fragmento deben coincidir con sus nodos visuales; los nodos no se comparten entre fragmentos. Cada sendero seleccionable necesita al menos un fragmento para poder encuadrarlo.

Los recuadros mantienen estado pendiente, fuente conocida y geometría nula. Se comprueban aristas completas frente al interior de los recuadros del mismo sendero, con la banda de límite de 3 px que ya usaba la revisión. Esta comprobación encuentra también una línea que cruce el hueco aunque ambos vértices estén fuera. La banda no es un permiso para interpolar ni una tolerancia geográfica. El JSON original sigue teniendo 9 fragmentos, 245 vértices y 7 zonas pendientes.

Una edición que viole estos contratos se rechaza antes de dibujar o habilitar la descarga. Estos contratos no sustituyen la comparación visual de nuevas geometrías.

## Reproducir pruebas

Desde la raíz de la rama, ejecutar `npm ci` si faltan dependencias y arrancar `npm run serve`. En otra terminal:

```sh
npm test
npm run test:browser
npm run test:sources
npm run build:standalone
npm run test:integrity
npm run test:standalone
```

Abrir `http://127.0.0.1:4173/revision.html` en la misma máquina que sirve el repositorio. Es una URL local de desarrollo. `test:integrity` usa como foto de prueba un JPG público ya incluido; no requiere adjuntos privados. Inyecta un error transitorio de decodificación y confirma que el siguiente intento vuelve a verificar y mostrar la imagen.

Para actualizar el sitio privado, conservar su ID en la copia de alojamiento y su audiencia del propietario. Generar el HTML con `scripts/build-standalone.py --reference-photo /ruta/privada/a/la/foto.jpg` solo cuando se deba incluir el adjunto. No añadir `dist/` con adjuntos privados ni credenciales a GitHub.

## Próxima decisión cartográfica

Las siete zonas siguen pendientes y no se han añadido curvas ni conexiones. La fidelidad visual debe aceptarse antes de avanzar. La investigación registró 10 referencias OSM, pero cero correspondencias píxel/geografía aceptadas. Faltan controles inequívocos e independientes para evaluar una transformación; no hay ajuste GPS validado.

Destinos, loops, distancias sobre caminos, sentidos y ajuste GPS quedan para después de validar esas correspondencias y la conectividad. No reutilizar las geometrías ilustrativas de `visor-vectorial.html` como datos comprobados.
