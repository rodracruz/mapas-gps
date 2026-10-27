#!/usr/bin/env python3
"""Build an inspectable document/geography comparison, never a registration."""
import html
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'docs/evidence/cartographic-fidelity'
esc = html.escape


def load(name):
    return json.loads((ROOT / name).read_text())


def path_node(p):
    attrs = {'d': p['d'], 'fill': p.get('fill') or 'none', 'stroke': p.get('stroke') or 'none',
             'stroke-width': p.get('strokeWidth', 0), 'fill-rule': p.get('fillRule', 'nonzero'),
             'stroke-linecap': p.get('lineCap', 'round'), 'stroke-linejoin': p.get('lineJoin', 'round')}
    if p.get('strokeDasharray'):
        attrs['stroke-dasharray'] = ' '.join(map(str, p['strokeDasharray']))
        attrs['stroke-dashoffset'] = p.get('strokeDashoffset', 0)
    return '<path ' + ' '.join(f'{key}="{esc(str(value), quote=True)}"' for key, value in attrs.items()) + '/>'


def source_svg(trail, all_paths):
    x, y, w, h = trail['bounds']
    pad = max(w, h) * .08
    view = f'{x-pad} {y-pad} {w+2*pad} {h+2*pad}'
    paths = list(trail['paths'])
    paths += [all_paths[i] for i in trail.get('sharedEndpointDrawingIds', []) if i not in trail['sourceDrawingIds']]
    return (f'<svg viewBox="{view}" role="img" aria-label="{esc(trail["name"])} en píxeles del plano">'
            '<image href="../../../sources/parquemet-mapa-oficial.jpg" width="6690" height="2835" opacity=".65"/>'
            + ''.join(path_node(p) for p in paths) + '</svg>')


def osm_svg(ways, nodes):
    projected = [[(6378137*math.radians(nodes[n]['lon']),
                   6378137*math.log(math.tan(math.pi/4+math.radians(nodes[n]['lat'])/2)))
                  for n in way['nodes']] for way in ways]
    points = [p for line in projected for p in line]
    xmin, xmax = min(p[0] for p in points), max(p[0] for p in points)
    ymin, ymax = min(p[1] for p in points), max(p[1] for p in points)
    w, h = xmax-xmin, ymax-ymin
    pad = max(w, h)*.08
    paths = ''.join('<path d="'+' '.join(('M' if i == 0 else 'L')+f'{x-xmin} {ymax-y}' for i, (x, y) in enumerate(line))
                    + '" fill="none" stroke="#b44746" stroke-width="2" vector-effect="non-scaling-stroke"/>' for line in projected)
    return f'<svg viewBox="{-pad} {-pad} {w+2*pad} {h+2*pad}" role="img" aria-label="Vías geográficas OSM, norte arriba">{paths}</svg>'


def build():
    inventory = load('docs/evidence/cartographic-fidelity/inventory.json')
    catalog = load('data/parquemet/geographic-catalog.json')
    snapshot = load(catalog['sourceSnapshot'])
    ways = {e['id']: e for e in snapshot['elements'] if e['type'] == 'way'}
    nodes = {e['id']: e for e in snapshot['elements'] if e['type'] == 'node'}
    cycling = load('data/parquemet/visual-cycling-trails.json')
    all_paths = {p['drawingIndex']: p for t in cycling['trails'] for p in t['paths']}
    pieces = ['''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>bikeride · Revisión cartográfica</title><style>
body{font:16px/1.5 system-ui,sans-serif;margin:0;color:#213e34;background:#f9faf5}main{max-width:1400px;margin:auto;padding:20px}h1{font-size:28px}h2{margin-top:32px}a{color:#285f47}figure{margin:0}figcaption{font-size:13px}img{max-width:100%;height:auto}section{margin:20px 0;padding:16px;background:white;border:1px solid #d3d9cf;border-radius:10px}.limit{background:#fff2da;padding:16px;border-left:5px solid #a56516}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pair svg{width:100%;height:310px;background:#f1f3ed;border:1px solid #dae0d4}.wide{overflow:auto}.wide img{max-width:none;width:2400px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left}small{display:block}code{font-size:12px}@media(max-width:650px){.pair{grid-template-columns:1fr}main{padding:12px}.pair svg{height:270px}}</style>
<main><h1>bikeride · Plano y geografía</h1>
<p>Corrección candidata sobre v22. Comparaciones de píxeles y datos reales; no son diseños simulados.</p>
<p class="limit"><strong>Georreferenciación sin validar.</strong> El Durazno conserva un registro aproximado, sin controles aceptados. Parquemet es una panorámica esquemática: sus líneas OSM se comparan por separado, sin inventar una transformación. Ninguna de estas capturas acredita GPS en terreno.</p>
<p><a href="../../../mapa-geografico.html#parque=el-durazno&vista=mapa">Abrir candidato El Durazno</a> · <a href="../../../parquemet.html#parque=parquemet&vista=mapa">Abrir candidato Parquemet</a> · <a href="inventory.json">Inventario editable</a> · <a href="registration-review.json">Referencias geográficas</a></p>
<h2>1. Fidelidad al documento</h2><p>En cada tira: original, v22 sin fondo, corrección sobre el plano y vectores corregidos. Todos usan el mismo marco de píxeles. Desplaza horizontalmente o abre la imagen para inspeccionarla a resolución completa.</p>''']
    for park, sectors in [('durazno', ['north', 'lower', 'skills']), ('parquemet', ['west', 'middle', 'east'])]:
        for sector in sectors:
            name = f'{park}-{sector}-comparison.png'
            pieces.append(f'<section><h3>{park} · {sector}</h3><div class="wide"><a href="{name}"><img src="{name}" alt="Comparación del sector en cuatro paneles"></a></div></section>')
    pieces.append('<h2>2. Parquemet: plano y fuente geográfica por sendero</h2><p>Izquierda: trazado original en píxeles del PDF, sobre su fondo. Derecha: vías OSM completas, con norte arriba y escala propia en Mercator. Los encuadres son independientes; no se afirma que exista una transformación entre ellos. No se unen los fragmentos de OSM ni los huecos del plano.</p>')
    route_audits = {r['id']: r for r in inventory['parks'][1]['routes']}
    for trail in cycling['trails']:
        audit = route_audits[trail['id']]
        selected = [ways[w['id']] for w in audit['osmWays']]
        bounds = [(nodes[n]['lon'], nodes[n]['lat']) for w in selected for n in w['nodes']]
        extent = f"{min(p[0] for p in bounds):.6f}, {min(p[1] for p in bounds):.6f} / {max(p[0] for p in bounds):.6f}, {max(p[1] for p in bounds):.6f}"
        links = ', '.join(f'<a href="{w["url"]}">{w["id"]} v{w["version"]}</a>' for w in audit['osmWays'])
        pieces.append(f'<section><h3>{esc(trail["name"])}</h3><div class="pair"><figure>{source_svg(trail, all_paths)}<figcaption>Documento oficial · {trail["officialDistanceM"]} m publicados</figcaption></figure><figure>{osm_svg(selected, nodes)}<figcaption>OSM · {audit["osmLengthM"]} m sumados · N ↑<small>Extensión lon/lat: {extent}</small></figcaption></figure></div><p>Vías: {links}. Correspondencia nominal; igualdad de extremos y extensión no verificada.</p></section>')
    pieces.append('<h2>3. Resultado en el mapa geográfico</h2><p>Mismo viewport 390 × 844 y mismo centro/zoom antes/después. Las teselas OSM se cargaron realmente (véase captures.json). El Durazno restaura arte bajo la misma transformación aproximada; Parquemet conserva su geografía OSM sin desplazarla para forzar parecido.</p>')
    for park in ['el-durazno', 'parquemet']:
        pieces.append(f'<section><h3>{park}</h3><div class="pair"><figure><img src="{park}-before-world.png" alt="Mapa geográfico antes"><figcaption>v22</figcaption></figure><figure><img src="{park}-after-world.png" alt="Mapa geográfico candidato"><figcaption>Candidato · precisión geográfica no validada</figcaption></figure></div></section>')
    pieces.append('<h2>Qué queda pendiente</h2><p>Falta una fuente geográfica legítima que identifique los trazados y controles remotos inequívocos, con referencias independientes de comprobación. No hace falta que el usuario visite el parque: servirían un plano georreferenciado del operador o GPX/KML oficiales con alcance/versiones, y contraste de hitos verificables. No sustituir un portón por el marcador genérico del parque ni hacer coincidir a la fuerza círculos editoriales y nodos OSM.</p><p>Las conexiones punteadas recuperadas son arte del documento; no autorizan paso, sentido, cruce ni navegación. En Parquemet quedan tres grupos verdes sin atribución y ocho entradas peatonales visibles en el original fuera del catálogo ciclista. Las avenidas tienen referencias/recortes documentales, no ejes extraídos del PDF.</p><p><a href="README.md">Informe, pruebas y límites</a> · <a href="captures.json">Cámaras y teselas</a></p></main></html>')
    DEST.mkdir(exist_ok=True, parents=True)
    (DEST / 'index.html').write_text('\n'.join(pieces))
    print('Review HTML generated from unchanged official/OSM inputs and actual app captures.')


if __name__ == '__main__':
    build()
