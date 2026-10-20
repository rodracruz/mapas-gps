#!/usr/bin/env python3
"""Record reviewed avenue views from the unchanged official Parquemet map.

The PDF's principal white roads are compound filled networks, not individual
named avenue centerlines. This extractor therefore emits original-image crop
views with exact native label evidence and no assigned route geometry. Two
names found only in the distance table remain unlocated reference records.
"""

import argparse
import html
import importlib.util
import json
from pathlib import Path
import sys

import fitz
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "sources/parquemet-mapa-oficial.pdf"
IMAGE_PATH = ROOT / "sources/parquemet-mapa-oficial.jpg"
OUTPUT_PATH = ROOT / "data/parquemet/visual-avenues.json"
IMAGE_SHA256 = "e0d91c5e90bbc290ae1af71d1b51e29960f682ab5dd242c3b24ede003f0a7dd3"
IMAGE_BYTES = 3251978

_spec = importlib.util.spec_from_file_location("parquemet_cycling_native", ROOT / "scripts/extract-parquemet-cycling.py")
native = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(native)

# The block groups and display rectangles were reviewed on the original image.
# A sourceRect is a contextual display crop, never a measured avenue extent.
# id, name, exact concatenated map label, source text block indices, x/y/w/h
VIEWS = [
    ("avenida-pedro-bannen", "Av. Pedro Bannen", "< Av. Pedro Bannen >", list(range(100, 119)), [1690, 860, 500, 440]),
    ("avenida-alberto-mackenna", "Av. Alberto Mackenna", "Av. Alberto Mackenna »", [36, 37], [1450, 550, 850, 650]),
    ("avenida-abate-molina", "Av. Abate Molina", "< Av. Abate Molina >", list(range(71, 86)), [2420, 1230, 340, 330]),
    ("avenida-carlos-martner", "Av. Carlos Martner", "< Av. Carlos Martner >", list(range(42, 49)), [2400, 1060, 800, 500]),
    ("avenida-carlos-reed", "Av. Carlos Reed", "< Av. Carlos Reed >", list(range(31, 36)), [1070, 1070, 1000, 480]),
    ("avenida-claudio-gay", "Av. Claudio Gay", "Av. Claudio Gay »", list(range(49, 56)), [3000, 1290, 620, 350]),
    ("avenida-federico-albert", "Av. Federico Albert", "« Av. Federico Albert", list(range(56, 65)), [3080, 1080, 740, 410]),
    ("avenida-manuel-zanartu", "Av. Manuel Zañartu", "< Av. Manuel Zañartu >", [65, 66], [3570, 1080, 980, 380]),
    ("avenida-la-montana", "Av. La Montaña", "< Av. La Montaña >", list(range(67, 71)), [2280, 675, 1140, 510]),
    ("avenida-gabriela-mistral", "Av. Gabriela Mistral", "Av. Gabriela Mistral >", list(range(38, 42)), [1980, 1120, 630, 260]),
    ("los-turistas", "Los Turistas", "< Los Turistas >", [13], [3160, 360, 330, 440]),
]

# id, name, exact table block, text block index, table-context rectangle
TABLE_MENTIONS = [
    ("avenida-pablo-neruda", "Av. Pablo Neruda", "por Av. M. Zañartu y Av. P. Neruda2,9 km", 291, [5820, 735, 750, 245]),
    ("camino-rafael-elizalde", "Camino Rafael Elizalde", "por Camino Rafael Elizalde170 m", 345, [5820, 480, 750, 245]),
]


def label_evidence(blocks, indices, expected):
    fragments = []
    for index in indices:
        block = blocks[index]
        spans = [s for line in block.get("lines", []) for s in line["spans"]]
        fragments.append({
            "blockIndex": index, "text": "".join(s["text"] for s in spans),
            "bounds": native.xywh(fitz.Rect(*block["bbox"])),
            "spanCount": len(spans),
        })
    text = "".join(f["text"] for f in fragments)
    if text != expected:
        raise ValueError(f"Native label blocks changed: {text!r} != {expected!r}")
    return {"text": text, "bounds": native.union_bounds([f["bounds"] for f in fragments]),
            "fragments": fragments, "blockIndexBase": 0,
            "extractor": "PyMuPDF page.get_text('dict'); reviewed source block order"}


def contains(outer, inner):
    return (inner[0] >= outer[0] and inner[1] >= outer[1]
            and inner[0] + inner[2] <= outer[0] + outer[2]
            and inner[1] + inner[3] <= outer[1] + outer[3])


def extract(pdf_path, image_path):
    raw = pdf_path.read_bytes()
    if len(raw) != native.PDF_BYTES or native.sha256(raw) != native.PDF_SHA256:
        raise ValueError("Source PDF bytes / SHA-256 differ from the retained official source")
    image_raw = image_path.read_bytes()
    if len(image_raw) != IMAGE_BYTES or native.sha256(image_raw) != IMAGE_SHA256:
        raise ValueError("Original image bytes / SHA-256 differ from the retained source render")
    with Image.open(image_path) as original:
        if original.size != (6690, 2835):
            raise ValueError("Original image dimensions changed")
    document = fitz.open(stream=raw, filetype="pdf")
    if len(document) != 1:
        raise ValueError("Expected one official source page")
    page = document[0]
    drawings = page.get_drawings()
    if len(drawings) != 3540 or page.rotation != 0:
        raise ValueError("Native drawing index or rotation changed; review source assignments")
    blocks = page.get_text("dict")["blocks"]
    views = []
    for view_id, name, label, indices, rect in VIEWS:
        evidence = label_evidence(blocks, indices, label)
        if not contains([0, 0, 6690, 2835], rect) or not contains(rect, evidence["bounds"]):
            raise ValueError(f"Reviewed crop no longer contains the native label: {view_id}")
        views.append({
            "id": view_id, "name": name, "category": "avenue",
            "kind": "document-crop", "viewKind": "original-map-crop",
            "scope": "approach-outside-park" if view_id == "los-turistas" else "inside-park",
            "coordinateSystem": "document-pixels",
            "sourceRect": rect, "viewBox": rect,
            "sourceLabelEvidence": evidence,
            "geometryStatus": "not-extracted", "routeGeometryAvailable": False,
            "paths": [], "extentMeaning": "reviewed display crop, not the avenue's full extent",
            "caption": ("Acceso exterior: rótulo y contexto del plano original; sin trazado individual extraído."
                        if view_id == "los-turistas" else
                        "Rótulo y contexto del plano original; sin trazado individual extraído."),
        })
    mentions = []
    for view_id, name, label, index, rect in TABLE_MENTIONS:
        evidence = label_evidence(blocks, [index], label)
        if not contains(rect, evidence["bounds"]):
            raise ValueError(f"Table reference crop no longer contains {name}")
        mentions.append({
            "id": view_id, "name": name, "category": "avenue",
            "kind": "document-reference", "viewKind": "distance-table-reference",
            "coordinateSystem": "document-pixels", "referenceTableRect": rect,
            "sourceLabelEvidence": evidence, "mapLocationStatus": "not-located-in-map",
            "geometryStatus": "not-extracted", "routeGeometryAvailable": False,
            "caption": "Referencia en la tabla de distancias del plano; sin ubicación dibujada identificada.",
        })
    groups = []
    for index, operations, cubic, line in [(738, 600, 547, 53), (748, 1852, 1418, 434)]:
        drawing = drawings[index]
        if (drawing["type"] != "f" or drawing["fill"] != (1, 1, 1)
                or len(drawing["items"]) != operations
                or sum(i[0] == "c" for i in drawing["items"]) != cubic
                or sum(i[0] == "l" for i in drawing["items"]) != line):
            raise ValueError(f"Inspected compound road polygon {index} changed")
        record = native.path_record(index, drawing, "unassigned-compound-road-network")
        groups.append({
            "drawingIndex": index, "seqno": drawing["seqno"], "type": drawing["type"],
            "fill": record["fill"], "bounds": record["bounds"],
            "operationCount": operations, "cubicCount": cubic, "lineCount": line,
            "nativePathContentSha256": record["contentSha256"],
            "assignedToAvenue": False, "centerlineAvailable": False,
            "reason": "One compound filled network spans multiple roads; it is not an individual named avenue.",
        })
    pending_approaches = [v for v in views if v["scope"] == "approach-outside-park"]
    for view in pending_approaches:
        view["assignedToTarget"] = False
        view["pendingReason"] = "The official 240 m access reference cannot be delimited against the retained geographic ways without clipping or inference."
    result = {
        "schemaVersion": 1, "id": "parquemet-official-avenue-views",
        "coordinateSystem": "document-pixels", "origin": "top-left",
        "image": {"path": "sources/parquemet-mapa-oficial.jpg", "width": 6690, "height": 2835,
                  "sha256": IMAGE_SHA256, "bytes": len(image_raw)},
        "page": {"widthPt": page.rect.width, "heightPt": page.rect.height, "rotation": page.rotation},
        "transform": [1, 0, 0, 1, 0, 0],
        "source": {
            "path": "sources/parquemet-mapa-oficial.pdf", "url": native.SOURCE_URL,
            "sha256": native.PDF_SHA256, "bytes": len(raw), "page": 1,
            "pageXref": page.xref, "contentStreamXrefs": page.get_contents(),
            "contentStreams": [{"xref": xref, "decodedSha256": native.sha256(document.xref_stream(xref))}
                               for xref in page.get_contents()],
            "drawingCount": len(drawings), "drawingIndexBase": 0,
            "extractor": "PyMuPDF page.get_drawings + native text blocks; manually reviewed crop index",
            "pyMuPdfVersion": fitz.VersionBind, "muPdfVersion": fitz.VersionFitz,
        },
        "fidelity": {
            "geometry": "not-extracted", "originalImageUnchanged": True,
            "rasterTracing": False, "interpolatedSegments": 0,
            "routeExtentInferred": False, "nameAssignmentByProximity": False,
            "boundsMeaning": "sourceRect, viewBox and label bounds are x,y,width,height in the unchanged original image",
            "registration": "Existing official-document.json records 72dpi/scale 1, top-left identity; no image stretching or world registration.",
        },
        "topology": {"crossingsAreJunctions": False, "connectionsInferred": False, "networkAvailable": False},
        "georeferencing": {"transform": None, "crs": None, "useForNavigation": False, "useForGroundDistances": False},
        "trails": [], "views": [v for v in views if v["scope"] == "inside-park"],
        "pendingApproachViews": pending_approaches, "pendingSourceMentions": mentions,
        "unassignedSourceDrawingGroups": groups,
        "contentHashDefinition": "SHA-256 of UTF-8 JSON with sorted keys, ensure_ascii=false and separators=(',',':'), excluding top-level contentSha256",
    }
    result["contentSha256"] = native.sha256(native.canonical(result))
    return result


def preview(result, pdf_path, image_path, output_dir):
    """QA only: original crop / native label evidence / unassigned road fill.

    No colored network geometry generated here is assigned to a named avenue.
    These QA SVGs deliberately show entire source polygons clipped to each view.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    page = fitz.open(pdf_path)[0]
    drawings = page.get_drawings()
    original = Image.open(image_path).convert("RGB")
    for view in result["views"] + result["pendingApproachViews"]:
        x, y, width, height = view["sourceRect"]
        crop = original.crop((x, y, x + width, y + height))
        labeled = crop.copy()
        draw = ImageDraw.Draw(labeled)
        for fragment in view["sourceLabelEvidence"]["fragments"]:
            lx, ly, lw, lh = fragment["bounds"]
            draw.rectangle((lx-x, ly-y, lx+lw-x, ly+lh-y), outline="#c400a7", width=1)
        paths = []
        for index in (738, 748):
            p = native.path_record(index, drawings[index], "unassigned-compound-road-network")
            paths.append(f'<path d="{html.escape(p["d"])}" fill="#007f88" fill-rule="{p["fillRule"]}"/>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
               f'viewBox="{x} {y} {width} {height}">{"".join(paths)}</svg>')
        svg_path = output_dir / f'{view["id"]}-unassigned-network.svg'
        svg_path.write_text(svg)
        pix = fitz.open(stream=svg.encode(), filetype="svg")[0].get_pixmap(alpha=True)
        network = Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)
        on_white = Image.new("RGBA", network.size, "white")
        on_white.alpha_composite(network)
        panel = Image.new("RGB", (width*3, height+52), "white")
        panel.paste(crop, (0, 52))
        panel.paste(labeled, (width, 52))
        panel.paste(on_white.convert("RGB"), (width*2, 52))
        titles = ("Original JPG crop", "Exact PDF label fragments", "Native compound roads: UNASSIGNED")
        for column, title in enumerate(titles):
            ImageDraw.Draw(panel).text((column*width+8, 8), title, fill="black")
        ImageDraw.Draw(panel).text((8, 28), view["name"] + ": display crop only; individual geometry not extracted", fill="black")
        panel.save(output_dir / f'{view["id"]}-comparison.png')
        crop.save(output_dir / f'{view["id"]}-original.png')
    for mention in result["pendingSourceMentions"]:
        x, y, width, height = mention["referenceTableRect"]
        crop = original.crop((x, y, x+width, y+height))
        crop.save(output_dir / f'{mention["id"]}-table-reference.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, default=PDF_PATH)
    parser.add_argument("--image", type=Path, default=IMAGE_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--preview", type=Path, help="Write original/label/unassigned-network QA tripanels")
    args = parser.parse_args()
    try:
        result = extract(args.pdf, args.image)
        encoded = (json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        if args.check:
            if args.output.read_bytes() != encoded:
                raise ValueError("Retained avenue views differ from the reviewed source index; regenerate and inspect")
        else:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(encoded)
        if args.preview:
            preview(result, args.pdf, args.image, args.preview)
        print(f"{len(result['views'])} original-map avenue views; {len(result['pendingApproachViews'])} pending approach; {len(result['pendingSourceMentions'])} unlocated table references; 0 avenue curves; content SHA-256 {result['contentSha256']}")
    except (OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
