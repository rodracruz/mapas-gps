#!/usr/bin/env python3
"""Extract the six inspected green Paseo Metropolitano sections from the PDF.

The drawing index below is a reviewed source assignment, never a proximity
classifier. Native curves, markers, separate objects and dash patterns survive
without raster tracing, simplification, gap filling, joins or GPS conversion.
"""

import argparse
import html
import importlib.util
import json
import math
from pathlib import Path
import shutil
import subprocess
import sys

import fitz


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "sources/parquemet-mapa-oficial.pdf"
OUTPUT_PATH = ROOT / "data/parquemet/visual-paseo-trails.json"

# Reuse the existing exact path_record/native_svg_path serialization unchanged.
_spec = importlib.util.spec_from_file_location("parquemet_cycling_native", ROOT / "scripts/extract-parquemet-cycling.py")
native = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(native)

# ID, exact legend name/distance, native object IDs, inspected badge regions and
# badge background object IDs. The second original badge 5 identifies the same
# Pirámide route. Green spur strokes 1362 and 1374 belong to the inspected source
# groups; their exact geometry remains separate from the main route strokes.
TRAILS = [
    ("paseo-infancia", "Tramo Parque B. de la Infancia", 940, "940 m.",
     [1362, 1365, 1366, 1367], [((1380, 730, 1440, 785), 1412)], [1362]),
    ("paseo-sentidos", "Sendero de los Sentidos", 540, "540 m.",
     [1363, 1364, 1368, 1369], [((1145, 910, 1200, 975), 1409)], []),
    ("paseo-bellavista", "Tramo Bellavista", 1000, "1 km.",
     [1370, 1371], [((1360, 1240, 1420, 1310), 1406)], []),
    ("paseo-pedro-valdivia", "Tramo Pedro de Valdivia", 1500, "1,5 km.",
     [1372, 1373, 1374, 1375], [((1990, 1325, 2040, 1390), 1403)], [1374]),
    ("paseo-piramide", "Tramo Pirámide / Jardín Japonés", 3700, "3,7 km.",
     list(range(1376, 1391)), [((2900, 1610, 2960, 1680), 1418), ((3800, 1260, 3860, 1330), 1421)], []),
    ("paseo-cascada", "Tramo La Cascada", 1200, "1,2 km.",
     [1391, 1392, 1393], [((2850, 1090, 2910, 1160), 1415)], []),
]


def green(color):
    return color and color[0] == 0 and .54 < color[1] < .55 and .47 < color[2] < .49


def gap_record(drawings, from_index, from_endpoint, to_index, to_endpoint, reason):
    def endpoint(index, side):
        item = drawings[index]["items"][0 if side == "start" else -1]
        return list(item[1] if side == "start" else item[-1])

    start, end = endpoint(from_index, from_endpoint), endpoint(to_index, to_endpoint)
    return {"fromDrawingIndex": from_index, "toDrawingIndex": to_index,
            "fromEndpoint": from_endpoint, "toEndpoint": to_endpoint,
            "from": start, "to": end, "documentGapPixels": math.dist(start, end),
            "interpolated": False, "reason": reason}


def extract(pdf_path):
    raw = pdf_path.read_bytes()
    if len(raw) != native.PDF_BYTES or native.sha256(raw) != native.PDF_SHA256:
        raise ValueError("Source PDF bytes / SHA-256 differ from the retained official source")
    document = fitz.open(stream=raw, filetype="pdf")
    if len(document) != 1:
        raise ValueError("Expected one official source page")
    page = document[0]
    drawings = page.get_drawings()
    if len(drawings) != 3540:
        raise ValueError("Native drawing index changed; source assignment must be reviewed")
    spans = native.text_spans(page)
    trails = []
    for number, (trail_id, name, distance, distance_text, indices, badge_specs, spurs) in enumerate(TRAILS, 1):
        paths = []
        for index in indices:
            drawing = drawings[index]
            if drawing["type"] not in ("s", "f") or not green(drawing["color"] or drawing["fill"]):
                raise ValueError(f"Drawing {index} is no longer the inspected green object")
            paths.append(native.path_record(index, drawing, "trail-stroke" if drawing["type"] == "s" else "endpoint-marker"))
        name_matches = [s for s in spans if s["text"] == name and 2900 < s["bbox"][0] < 3500 and s["bbox"][1] > 2300]
        if len(name_matches) != 1:
            raise ValueError(f"Cannot uniquely identify official Paseo legend entry {name!r}")
        legend_span = name_matches[0]
        distances = [s for s in spans if s["text"] == distance_text and 2900 < s["bbox"][0] < 3550
                     and abs(s["origin"][1] - legend_span["origin"][1]) < .01]
        if len(distances) != 1:
            raise ValueError(f"Cannot uniquely identify official distance for {name!r}")
        labels = []
        for label_rect, badge_index in badge_specs:
            label = native.label_evidence(spans, number, label_rect)
            badge = drawings[badge_index]
            if not green(badge["fill"]) or not badge["rect"].contains(fitz.Point(*label["origin"])):
                raise ValueError(f"Badge {number} no longer has its inspected green background")
            label.update({"badgeDrawingIndex": badge_index, "badgeBounds": native.xywh(badge["rect"])})
            labels.append(label)
        trail = {
            "id": trail_id, "name": name, "category": "shared-trail", "number": number,
            "officialDistanceM": distance, "coordinateSystem": "document-pixels",
            "fidelity": "native-pdf-centerline", "sourceDrawingIds": indices,
            "sourceDashedDrawingIds": [p["drawingIndex"] for p in paths if p["strokeDasharray"]],
            "sourceSpurDrawingIds": spurs, "paths": paths,
            "bounds": native.union_bounds([p["bounds"] for p in paths]),
            "label": labels[0], "labels": labels,
            "legend": {"text": name, "bounds": native.xywh(fitz.Rect(*legend_span["bbox"])),
                       "distanceText": distance_text, "distanceBounds": native.xywh(fitz.Rect(*distances[0]["bbox"]))},
            "leaderPaths": [], "missingConnections": [], "sourceStrokeTransitions": [],
        }
        if number == 2:
            trail["missingConnections"].append(gap_record(drawings, 1363, "end", 1368, "start",
                "No native green trail path between the two Sentidos source drawing groups near the funicular"))
        if number == 5:
            # These are source dash/cap boundaries, not missing route sections.
            # Keep their exact small gaps as evidence; never fit joining lines.
            transitions = [(1376, "end", 1384, "end"), (1384, "start", 1383, "end"),
                           (1383, "start", 1382, "end"), (1382, "start", 1378, "start"),
                           (1378, "end", 1387, "end"), (1387, "start", 1386, "end"),
                           (1386, "start", 1385, "end"), (1385, "start", 1379, "start"),
                           (1379, "end", 1390, "end"), (1390, "start", 1389, "end"),
                           (1389, "start", 1388, "end"), (1388, "start", 1380, "start")]
            trail["sourceStrokeTransitions"] = [gap_record(drawings, *transition,
                "Native source gap at a solid/dashed stroke or dash-cap boundary") for transition in transitions]
        trails.append(trail)
    result = {
        "schemaVersion": 1, "id": "parquemet-official-paseo-trails",
        "coordinateSystem": "document-pixels", "origin": "top-left",
        "image": {"width": 6690, "height": 2835},
        "page": {"widthPt": page.rect.width, "heightPt": page.rect.height, "rotation": page.rotation},
        "transform": [1, 0, 0, 1, 0, 0],
        "source": {
            "path": "sources/parquemet-mapa-oficial.pdf", "url": native.SOURCE_URL,
            "sha256": native.PDF_SHA256, "bytes": len(raw), "page": 1,
            "pageXref": page.xref, "contentStreamXrefs": page.get_contents(),
            "contentStreams": [{"xref": xref, "decodedSha256": native.sha256(document.xref_stream(xref))}
                               for xref in page.get_contents()],
            "drawingCount": len(drawings), "drawingIndexBase": 0,
            "extractor": "PyMuPDF page.get_drawings", "pyMuPdfVersion": fitz.VersionBind,
            "muPdfVersion": fitz.VersionFitz,
        },
        "fidelity": {
            "geometry": "native-pdf-centerline", "simplificationTolerance": 0,
            "interpolatedSegments": 0, "coordinateRounding": False, "rasterTracing": False,
            "preservesCubicControlPoints": True, "preservesSeparateDrawings": True,
            "preservesSourceDashPatterns": True, "sourceOverpaintingRetainedInRasterOnly": True,
            "boundsMeaning": "x,y,width,height; control-point box expanded by half source stroke width",
            "svgColorNote": "Hex colors are rounded PyMuPDF RGB; original float RGB is retained. PDF color management may render differently.",
        },
        "topology": {"crossingsAreJunctions": False, "connectionsInferred": False, "networkAvailable": False},
        "georeferencing": {"transform": None, "crs": None, "useForNavigation": False, "useForGroundDistances": False},
        "trails": trails,
        "pendingSourceGroups": [{
            "drawingIndices": list(range(first, first + 3)), "assignedToTrail": False,
            "bounds": native.union_bounds([native.xywh(drawings[i]["rect"]) for i in range(first, first + 3)]),
            "reason": "Unnumbered dotted green source objects are not visibly linked to a numbered Paseo badge; nearby red no-entry artwork does not establish their route identity",
        } for first in (1394, 1397, 1400)],
        "contentHashDefinition": "SHA-256 of UTF-8 JSON with sorted keys, ensure_ascii=false and separators=(',',':'), excluding top-level contentSha256",
    }
    result["contentSha256"] = native.sha256(native.canonical(result))
    return result


def preview(result, pdf_path, output_dir):
    """Render original/overlay/vector tripanels using the exact source styling."""
    from PIL import Image, ImageDraw

    if not shutil.which("inkscape"):
        raise ValueError("Optional QA preview requires Inkscape to preserve SVG stroke dash patterns")
    output_dir.mkdir(parents=True, exist_ok=True)
    document = fitz.open(pdf_path)
    page = document[0]
    colors = ["#9500c8", "#006aff", "#b0006a", "#df6500", "#0062ce", "#a000b5"]
    crops = [("infancia-sentidos", (1100, 570, 1710, 1160), 1.5),
             ("bellavista", (1190, 1190, 1770, 1445), 2),
             ("pedro-valdivia", (1800, 1300, 2460, 1450), 2),
             ("piramide-west", (2610, 1350, 3260, 1685), 1.5),
             ("piramide-middle", (3230, 1340, 3650, 1630), 2),
             ("piramide-east", (3580, 1200, 4310, 1400), 2),
             ("cascada", (2720, 950, 3150, 1160), 2)]
    for name, box, scale in crops:
        clip = fitz.Rect(*box)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip)
        source = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
        paths = []
        for trail, color in zip(result["trails"], colors):
            for path in trail["paths"]:
                dashes = ' stroke-dasharray="' + " ".join(map(str, path["strokeDasharray"])) + '"' if path["strokeDasharray"] else ""
                paths.append(f'<path d="{html.escape(path["d"])}" stroke="{color if path["stroke"] else "none"}" '
                             f'fill="{color if path["fill"] else "none"}" stroke-width="{path["strokeWidth"]}" '
                             f'stroke-linecap="{path["lineCap"]}" stroke-linejoin="{path["lineJoin"]}"'
                             f'{dashes} stroke-dashoffset="{path["strokeDashoffset"]}"/>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{source.width}" height="{source.height}" '
               f'viewBox="{clip.x0} {clip.y0} {clip.width} {clip.height}">' + "".join(paths) + "</svg>")
        svg_path = output_dir / f"{name}-native.svg"
        png_path = output_dir / f"{name}-native.png"
        svg_path.write_text(svg, encoding="utf-8")
        # MuPDF's SVG renderer drops stroke-dasharray here. Inkscape retains
        # the exact source patterns and cap styles used by the serialized SVG.
        rendered = subprocess.run(["inkscape", str(svg_path), "--export-type=png", f"--export-filename={png_path}"],
                                  capture_output=True, text=True)
        if rendered.returncode:
            raise ValueError("Inkscape QA render failed: " + rendered.stderr.strip())
        vector = Image.open(png_path).convert("RGBA")
        overlay = source.convert("RGBA")
        overlay.alpha_composite(vector)
        white = Image.new("RGBA", source.size, "white")
        white.alpha_composite(vector)
        panel = Image.new("RGB", (source.width * 3, source.height + 36), "white")
        panel.paste(source, (0, 36))
        panel.paste(overlay.convert("RGB"), (source.width, 36))
        panel.paste(white.convert("RGB"), (source.width * 2, 36))
        draw = ImageDraw.Draw(panel)
        for i, title in enumerate(("Original PDF", "Native source curves over PDF", "Native source curves only")):
            draw.text((i * source.width + 12, 10), title, fill="black")
        panel.save(output_dir / f"{name}-comparison.png")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, default=PDF_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--check", action="store_true", help="Fail if retained output differs from native extraction")
    parser.add_argument("--preview", type=Path, help="Write original/overlay/vector QA tripanels here")
    args = parser.parse_args()
    try:
        result = extract(args.pdf)
        encoded = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        if args.check:
            if args.output.read_bytes() != encoded:
                raise ValueError("Retained Paseo extraction differs from the original PDF; regenerate and inspect")
        else:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(encoded)
        if args.preview:
            preview(result, args.pdf, args.preview)
        print(f"{len(result['trails'])} shared trails; {sum(len(t['paths']) for t in result['trails'])} native drawings; content SHA-256 {result['contentSha256']}")
    except (OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
