#!/usr/bin/env python3
"""Extract the eight numbered cyclist trails from the retained Parquemet PDF.

The numbered assignment is an inspected source index, not a spatial classifier.
Each original drawing is serialized independently, including its native dashes.
No raster tracing, curve flattening, gap filling, joins, or GPS conversion occurs.
"""

import argparse
import hashlib
import html
import json
import math
from pathlib import Path
import re
import sys

import fitz


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "sources/parquemet-mapa-oficial.pdf"
OUTPUT_PATH = ROOT / "data/parquemet/visual-cycling-trails.json"
PDF_SHA256 = "e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8"
PDF_BYTES = 765376
SOURCE_URL = "https://mapas.parquemet.cl/doc/MapaParque.pdf"

# Assignment verified against the native-resolution map, white numbered red
# cyclist badges, their leader lines, and the eight-name cyclist legend.
TRAILS = [
    ("centenario", "Centenario", 900, range(1259, 1266), [1260, 1262], (1500, 1100, 1700, 1200), []),
    ("cuatro-y-medio", "4 ½", 1000, range(1266, 1271), [1267], (1600, 1200, 1700, 1300), []),
    ("anfiteatro", "Anfiteatro", 700, range(1276, 1287), [1277, 1281, 1284], (3000, 1450, 3150, 1550), [1309]),
    ("la-s", "La S", 500, range(1287, 1291), [1288], (3200, 1100, 3350, 1200), [1324]),
    ("zorzal", "Zorzal", 500, range(1291, 1295), [1292], (3400, 1100, 3550, 1200), [1325]),
    ("pa-arriba", "Pa’ arriba", 600, range(1295, 1299), [1296], (3400, 1350, 3550, 1450), [1326]),
    ("torre-5", "Torre 5", 800, range(1271, 1276), [1272], (3300, 1450, 3450, 1550), []),
    ("piramide", "Pirámide", 600, range(1299, 1302), [1299], (3900, 1100, 4100, 1250), []),
]


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def xywh(rect, padding=0):
    return [rect.x0 - padding, rect.y0 - padding,
            rect.width + 2 * padding, rect.height + 2 * padding]


def union_bounds(bounds):
    x0 = min(b[0] for b in bounds)
    y0 = min(b[1] for b in bounds)
    x1 = max(b[0] + b[2] for b in bounds)
    y1 = max(b[1] + b[3] for b in bounds)
    return [x0, y0, x1 - x0, y1 - y0]


def svg_number(value):
    # Python's round-trip float representation: no coordinate rounding.
    return repr(float(value))


def point_text(point):
    return f"{svg_number(point.x)} {svg_number(point.y)}"


def native_svg_path(drawing):
    commands = []
    current = None
    for item in drawing["items"]:
        op = item[0]
        if op not in ("l", "c"):
            raise ValueError(f"Unexpected native operation {op!r}; refuse conversion")
        if current != item[1]:
            commands.append("M " + point_text(item[1]))
        if op == "l":
            commands.append("L " + point_text(item[2]))
        else:
            commands.append("C " + " ".join(point_text(p) for p in item[2:]))
        current = item[-1]
    if drawing.get("closePath"):
        commands.append("Z")
    return " ".join(commands)


def hex_color(color):
    return None if color is None else "#" + "".join(f"{round(c * 255):02x}" for c in color)


def path_record(index, drawing, role):
    dash = re.fullmatch(r"\[\s*([^]]*?)\s*\]\s*([-\d.]+)", drawing.get("dashes") or "[] 0")
    if not dash:
        raise ValueError(f"Unrecognized dashes for drawing {index}")
    width = drawing.get("width")
    stroke = drawing.get("color")
    fill = drawing.get("fill")
    record = {
        "id": f"pdf-p1-drawing-{index}",
        "drawingIndex": index,
        "seqno": drawing["seqno"],
        "sourceLayer": drawing.get("layer"),
        "role": role,
        "d": native_svg_path(drawing),
        "bounds": xywh(drawing["rect"], width / 2 if width else 0),
        "stroke": hex_color(stroke),
        "strokeRgb": list(stroke) if stroke else None,
        "strokeWidth": width or 0,
        "strokeDasharray": [float(v) for v in dash[1].split()],
        "strokeDashoffset": float(dash[2]),
        "lineCap": "round" if drawing.get("lineCap") == (1, 1, 1) else "butt",
        "lineJoin": "round" if drawing.get("lineJoin") == 1 else "miter",
        "fill": hex_color(fill),
        "fillRgb": list(fill) if fill else None,
        "fillRule": "evenodd" if drawing.get("even_odd") else "nonzero",
        "opacity": drawing.get("stroke_opacity") if stroke else drawing.get("fill_opacity"),
    }
    record["contentSha256"] = sha256(canonical(record))
    return record


def text_spans(page):
    return [span for block in page.get_text("dict")["blocks"]
            for line in block.get("lines", []) for span in line["spans"]]


def label_evidence(spans, number, rect):
    area = fitz.Rect(*rect)
    labels = [s for s in spans if s["text"] == str(number)
              and s["color"] == 0xFFFFFF and area.contains(fitz.Point(*s["origin"]))
              and 39 < s["size"] < 40]
    if len(labels) != 1:
        raise ValueError(f"Cannot uniquely identify official cyclist badge {number}")
    label = labels[0]
    return {"number": number, "text": label["text"],
            "bounds": xywh(fitz.Rect(*label["bbox"])),
            "origin": list(label["origin"]), "font": label["font"]}


def extract(pdf_path):
    raw = pdf_path.read_bytes()
    if len(raw) != PDF_BYTES or sha256(raw) != PDF_SHA256:
        raise ValueError("Source PDF bytes / SHA-256 differ from the retained official source")
    document = fitz.open(stream=raw, filetype="pdf")
    if len(document) != 1:
        raise ValueError("Expected one official source page")
    page = document[0]
    drawings = page.get_drawings()
    if len(drawings) != 3540:
        raise ValueError("Native drawing index changed; source assignment must be reviewed")
    spans = text_spans(page)
    trails = []
    for number, (trail_id, name, distance, indices, dashed, label_rect, leaders) in enumerate(TRAILS, 1):
        paths = []
        for index in indices:
            drawing = drawings[index]
            is_stroke = drawing["type"] == "s"
            red = drawing["color"] if is_stroke else drawing["fill"]
            if not red or not (red[0] > .9 and .21 < red[1] < .24 and .21 < red[2] < .24):
                raise ValueError(f"Drawing {index} is no longer the inspected red object")
            paths.append(path_record(index, drawing, "trail-stroke" if is_stroke else "endpoint-marker"))
        name_matches = [s for s in spans if s["text"] == name and s["bbox"][0] > 4300 and s["bbox"][1] > 2300]
        if len(name_matches) != 1:
            raise ValueError(f"Official legend no longer contains one {name!r}")
        trail = {
            "id": trail_id, "name": name, "number": number,
            "officialDistanceM": distance,
            "coordinateSystem": "document-pixels",
            "fidelity": "native-pdf-centerline",
            "sourceDrawingIds": list(indices),
            "sourceDashedDrawingIds": dashed,
            "sharedEndpointDrawingIds": [1279] if number in (4, 5, 6) else [1269] if number == 1 else [],
            "paths": paths,
            "bounds": union_bounds([p["bounds"] for p in paths]),
            "label": label_evidence(spans, number, label_rect),
            "legend": {"text": name, "bounds": xywh(fitz.Rect(*name_matches[0]["bbox"]))},
            "leaderPaths": [path_record(i, drawings[i], "label-leader") for i in leaders],
            "missingConnections": [],
        }
        # These are actual omissions between three original drawing groups,
        # beyond the short end dashes. No missing geometry is synthesized.
        if number == 3:
            for from_index, to_index in [(1285, 1280), (1282, 1276)]:
                start = list(drawings[from_index]["items"][-1][-1])
                end = list(drawings[to_index]["items"][0][1])
                trail["missingConnections"].append({
                    "fromDrawingIndex": from_index, "toDrawingIndex": to_index,
                    "from": start, "to": end,
                    "documentGapPixels": math.dist(start, end),
                    "interpolated": False,
                    "reason": "No native red trail path between these source drawing groups",
                })
        trails.append(trail)
    result = {
        "schemaVersion": 1,
        "id": "parquemet-official-cycling-trails",
        "coordinateSystem": "document-pixels",
        "origin": "top-left",
        "image": {"width": 6690, "height": 2835},
        "page": {"widthPt": page.rect.width, "heightPt": page.rect.height, "rotation": page.rotation},
        "transform": [1, 0, 0, 1, 0, 0],
        "source": {
            "path": "sources/parquemet-mapa-oficial.pdf", "url": SOURCE_URL,
            "sha256": PDF_SHA256, "bytes": len(raw), "page": 1,
            "pageXref": page.xref, "contentStreamXrefs": page.get_contents(),
            "contentStreams": [{"xref": xref, "decodedSha256": sha256(document.xref_stream(xref))}
                               for xref in page.get_contents()],
            "drawingCount": len(drawings), "drawingIndexBase": 0,
            "extractor": "PyMuPDF page.get_drawings", "pyMuPdfVersion": fitz.VersionBind,
            "muPdfVersion": fitz.VersionFitz,
        },
        "fidelity": {
            "geometry": "native-pdf-centerline",
            "simplificationTolerance": 0, "interpolatedSegments": 0,
            "coordinateRounding": False, "rasterTracing": False,
            "preservesCubicControlPoints": True, "preservesSeparateDrawings": True,
            "preservesSourceDashPatterns": True,
            "sourceOverpaintingRetainedInRasterOnly": True,
            "boundsMeaning": "x,y,width,height; control-point box expanded by half source stroke width",
            "svgColorNote": "Hex colors are rounded PyMuPDF RGB; original float RGB is retained. PDF color management may render differently.",
        },
        "topology": {"crossingsAreJunctions": False, "connectionsInferred": False,
                     "networkAvailable": False},
        "georeferencing": {"transform": None, "crs": None, "useForNavigation": False,
                           "useForGroundDistances": False},
        "trails": trails,
        "contentHashDefinition": "SHA-256 of UTF-8 JSON with sorted keys, ensure_ascii=false and separators=(',',':'), excluding top-level contentSha256",
    }
    result["contentSha256"] = sha256(canonical(result))
    return result


def preview(result, pdf_path, output_dir):
    """Produce source/overlay/vector comparison crops without fitting new lines."""
    from PIL import Image, ImageDraw

    output_dir.mkdir(parents=True, exist_ok=True)
    page = fitz.open(pdf_path)[0]
    colors = ["#9b00ff", "#006aff", "#00b4b5", "#ff7300", "#98006b", "#1540a6", "#9f6800", "#006b26"]
    crops = [("left", [1480, 930, 1920, 1450], 2),
             ("middle", [2960, 1100, 3580, 1650], 2),
             ("piramide", [3780, 1080, 4350, 1300], 2)]
    for name, box, scale in crops:
        clip = fitz.Rect(*box)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip)
        source = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
        paths = []
        for trail, color in zip(result["trails"], colors):
            for path in trail["paths"]:
                stroke = color if path["stroke"] else "none"
                fill = color if path["fill"] else "none"
                # Cyan/colored full centerline is deliberately used for QA so
                # that source dash gaps and hidden original spans are visible.
                paths.append(f'<path d="{html.escape(path["d"])}" stroke="{stroke}" '
                             f'fill="{fill}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{clip.width * scale}" '
               f'height="{clip.height * scale}" viewBox="{clip.x0} {clip.y0} {clip.width} {clip.height}">'
               + "".join(paths) + "</svg>")
        svg_path = output_dir / f"{name}-native.svg"
        svg_path.write_text(svg, encoding="utf-8")
        vector_pix = fitz.open(stream=svg.encode(), filetype="svg").get_page_pixmap(0, alpha=True)
        vector = Image.frombytes("RGBA", [vector_pix.width, vector_pix.height], vector_pix.samples)
        overlay = source.convert("RGBA")
        overlay.alpha_composite(vector)
        white = Image.new("RGBA", source.size, "white")
        white.alpha_composite(vector)
        panel = Image.new("RGB", (source.width * 3, source.height + 36), "white")
        panel.paste(source, (0, 36)); panel.paste(overlay.convert("RGB"), (source.width, 36))
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
    parser.add_argument("--preview", type=Path, help="Write three original/overlay/vector QA comparison crops here")
    args = parser.parse_args()
    try:
        result = extract(args.pdf)
        encoded = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        if args.check:
            if args.output.read_bytes() != encoded:
                raise ValueError("Retained visual extraction differs from the original PDF; regenerate and inspect")
        else:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(encoded)
        if args.preview:
            preview(result, args.pdf, args.preview)
        print(f"{len(result['trails'])} trails; 43 native drawings; content SHA-256 {result['contentSha256']}")
    except (OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
